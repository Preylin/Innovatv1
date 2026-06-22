import base64
import binascii
import json
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.almacen.catalogos.ModelsAlmacenIngresoMaterial import IngresoMaterial
from app.api.v1.almacen.catalogos.SchemaAlmacenIngresoMaterial import RegistrarProveedorRequestMaterial, RegistroIngresoMaterialCreate, RegistroIngresoMaterialOut, StockActualMaterialDetallado, StockActualLimitMaterial
from app.core.db import get_session
from app.core.deps import get_current_user

logger = logging.getLogger("uvicorn.error")

router_ingresoMaterial = APIRouter(
    prefix="/ingresoMaterial",
    tags=["ingresoMaterial"],
    dependencies=[Depends(get_current_user)],
)


@router_ingresoMaterial.post("", response_model=List[RegistroIngresoMaterialOut], status_code=status.HTTP_201_CREATED)
async def crear_ingresoMaterial(
    data: str = Form(...),  # Recibe el JSON stringificado
    files: List[UploadFile] = File(None),  # Recibe los archivos binarios
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Parsear y validar el JSON
        try:
            raw_json = json.loads(data)
            validated_data = RegistrarProveedorRequestMaterial(**raw_json)
        except Exception as e:
            logger.error(f"Error parseando JSON de ingreso: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Error en formato JSON: {str(e)}")

        # 2. Mapear archivos binarios por nombre para búsqueda rápida
        files_map = {}
        if files:
            for f in files:
                files_map[f.filename] = await f.read()

        nuevos_registros = []

        # 3. Procesar productos y aplanar para la base de datos
        for p_idx, p in enumerate(validated_data.productos):
            
            # Buscamos la imagen binaria usando la convención del frontend: prod_{index}_img_0.jpg
            filename_expected = f"prod_{p_idx}_img_0.jpg"
            img_bytes = files_map.get(filename_expected)

            # Creamos el objeto de base de datos directamente
            registro_db = IngresoMaterial(
                ruc=validated_data.ruc,
                proveedor=validated_data.proveedor,
                serieNumCP=validated_data.serieNumCP,
                serieNumGR=validated_data.serieNumGR,
                condicion=validated_data.condicion,
                fecha=validated_data.fecha,
                moneda=validated_data.moneda,
                # Datos del producto
                uuid_material=p.uuid_material,
                codigo=p.codigo,
                name=p.name,
                marca=p.marca,
                modelo=p.modelo,
                medida=p.medida,
                dimension=p.dimension,
                tipo=p.tipo,
                serie=p.serie,
                cantidad=p.cantidad,
                valor=p.valor,
                ubicacion=p.ubicacion,
                # Asignamos los bytes binarios (si existen)
                image_byte=img_bytes 
            )
            nuevos_registros.append(registro_db)

        # 4. Guardar en Base de Datos
        session.add_all(nuevos_registros)
        await session.commit()
        
        # Refrescar para obtener IDs generados y campos automáticos (created_at)
        for r in nuevos_registros:
            await session.refresh(r)

        return nuevos_registros

    except IntegrityError as e:
        await session.rollback()
        logger.error(f"Error de integridad en ingreso: {e}")
        raise HTTPException(
            status_code=400, 
            detail="Error de integridad: Posible duplicado de serie o documento."
        )
    except Exception as e:
        await session.rollback()
        logger.error(f"Error inesperado en ingreso: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router_ingresoMaterial.get("", response_model=List[RegistroIngresoMaterialOut])
async def listar_ingresoMaterial(session: AsyncSession = Depends(get_session)):
    stmt = select(IngresoMaterial).order_by(IngresoMaterial.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_ingresoMaterial.get("/stock_actual_detallado", response_model=List[StockActualMaterialDetallado])
async def obtener_stock_actual(session: AsyncSession = Depends(get_session)):
    query = text("SELECT * FROM almacen.v_stock_actual_detallado_material ;")
    result = await session.execute(query)
    return result.mappings().all()

@router_ingresoMaterial.get("/stock_actual_limite", response_model=List[StockActualLimitMaterial])
async def obtener_stock_actual_limite(session: AsyncSession = Depends(get_session)):
    query = text("SELECT * FROM almacen.v_stock_actual_material_limit;")
    result = await session.execute(query)
    return result.mappings().all()

@router_ingresoMaterial.delete("/{ingresoMaterial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_ingresoMaterial(ingresoMaterial_id: int, session: AsyncSession = Depends(get_session)):
    ingresoMaterial = await session.get(IngresoMaterial, ingresoMaterial_id)
    if not ingresoMaterial:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(ingresoMaterial)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
