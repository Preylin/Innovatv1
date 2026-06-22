import base64
import binascii
import json
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.almacen.catalogos.modelos import IngresoGlobalIn
from app.api.v1.almacen.catalogos.ModelsAlmacenIngresoMercaderia import IngresoMercaderia
from app.api.v1.almacen.catalogos.SchemaAlmacenIngresoMercaderia import RegistrarProveedorRequestMercaderia, RegistroIngresoMercaderiaCreate, RegistroIngresoMercaderiaOut, StockActualDetallado, StockActualLimitMercaderia
from app.core.db import get_session
from app.core.deps import get_current_user

logger = logging.getLogger("uvicorn.error")

# ---------- HELPERS ----------

router_ingresoMercaderia = APIRouter(
    prefix="/ingresoMercaderia",
    tags=["ingresoMercaderia"],
    dependencies=[Depends(get_current_user)],
)

@router_ingresoMercaderia.post("", response_model=List[RegistroIngresoMercaderiaOut])
async def crear_ingreso_mercaderia(
    data: str = Form(...), # Recibe el JSON string
    files: List[UploadFile] = File(None), # Recibe todos los archivos
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Parsear el JSON manual
        raw_json = json.loads(data)
        validated_data = IngresoGlobalIn(**raw_json)
        
        # 2. Mapear archivos por su nombre de campo (file_pIdx_sIdx)
        files_map = {f.filename: await f.read() for f in (files or [])}
        
        resultado_db = []
        
        # 3. Aplanar la estructura (Tu "crear_estructura_de_datos" adaptada)
        for p_idx, producto in enumerate(validated_data.productos):
            for s_idx, serie_item in enumerate(producto.serie):
                
                # Buscamos si existe una imagen para esta combinación de producto/serie
                filename_expected = f"image_{p_idx}_{s_idx}.jpg"
                img_bytes = files_map.get(filename_expected)
                
                nuevo_registro = IngresoMercaderia(
                    ruc=validated_data.ruc,
                    proveedor=validated_data.proveedor,
                    serieNumCP=validated_data.serieNumCP,
                    serieNumGR=validated_data.serieNumGR,
                    condicion=validated_data.condicion,
                    fecha=validated_data.fecha,
                    moneda=validated_data.moneda,
                    # Datos del producto
                    uuid_mercaderia=producto.uuid_mercaderia,
                    codigo=producto.codigo,
                    name=producto.name,
                    marca=producto.marca,
                    modelo=producto.modelo,
                    medida=producto.medida,
                    dimension=producto.dimension,
                    categoria=producto.categoria,
                    ubicacion=producto.ubicacion,
                    valor=producto.valor,
                    # Dato de la serie e imagen
                    serie=serie_item.get("codigo"),
                    cantidad=serie_item.get("cantidad"),
                    image_byte=img_bytes
                )
                resultado_db.append(nuevo_registro)

        # 4. Guardar en DB
        session.add_all(resultado_db)
        await session.commit()
        
        return resultado_db

    except Exception as e:
        await session.rollback()
        logger.error(f"Error procesando ingreso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router_ingresoMercaderia.get("", response_model=List[RegistroIngresoMercaderiaOut])
async def listar_ingresoMercaderia(session: AsyncSession = Depends(get_session)):
    stmt = select(IngresoMercaderia).order_by(IngresoMercaderia.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_ingresoMercaderia.get("/stock_actual_detallado", response_model=List[StockActualDetallado])
async def obtener_stock_actual(session: AsyncSession = Depends(get_session)):
    query = text("SELECT * FROM almacen.v_stock_actual_detallado;")
    result = await session.execute(query)
    return result.mappings().all()

@router_ingresoMercaderia.get("/stock_actual_limite", response_model=List[StockActualLimitMercaderia])
async def obtener_stock_actual_limite(session: AsyncSession = Depends(get_session)):
    query = text("SELECT * FROM almacen.v_stock_actual_mercaderia_limit;")
    result = await session.execute(query)
    return result.mappings().all()

@router_ingresoMercaderia.delete("/{ingresoMercaderia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_ingresoMercaderia(ingresoMercaderia_id: int, session: AsyncSession = Depends(get_session)):
    ingresoMercaderia = await session.get(IngresoMercaderia, ingresoMercaderia_id)
    if not ingresoMercaderia:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(ingresoMercaderia)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
