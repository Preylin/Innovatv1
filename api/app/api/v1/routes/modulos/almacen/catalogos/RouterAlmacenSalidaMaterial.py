import json
import logging
from typing import List

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.modulos.almacen.catalogos.ModelsAlmacenSalidaMaterial import SalidaMaterial
from app.api.v1.schemas.modulos.almacen.catalogos.SchemaAlmacenSalidaMaterial import RegistrarClienteRequestMaterial, RegistroSalidaMaterialCreate, RegistroSalidaMaterialOut
from app.core.db import get_session
from app.core.deps import get_current_user

logger = logging.getLogger("uvicorn.error")

# ---------- HELPERS ----------

router_salidaMaterial = APIRouter(
    prefix="/salidaMaterial",
    tags=["salidaMaterial"],
    dependencies=[Depends(get_current_user)],
)



@router_salidaMaterial.post("", response_model=List[RegistroSalidaMaterialOut], status_code=status.HTTP_201_CREATED)
async def crear_SalidaMaterial(
    data: str = Form(...),  # Recibe el JSON como string
    files: List[UploadFile] = File(None),  # Recibe los archivos binarios
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Parsear el JSON manual y validar con Pydantic
        try:
            raw_json = json.loads(data)
            # Validamos contra tu esquema existente
            validated_data = RegistrarClienteRequestMaterial(**raw_json)
        except Exception as e:
            logger.error(f"Error parseando JSON: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Error en formato JSON: {str(e)}")

        # 2. Crear un mapa de archivos para acceso rápido
        # El frontend envía nombres como: prod_{pIdx}_img_{iIdx}.jpg
        files_map = {}
        if files:
            for f in files:
                files_map[f.filename] = await f.read()

        nuevos_registros = []

        # 3. Procesar productos y asociar sus imágenes binarias
        for p_idx, p in enumerate(validated_data.productos):
            
            # Buscamos la imagen correspondiente al producto basándonos en el índice
            # Según tu frontend anterior: "prod_{pIdx}_img_0.jpg"
            filename_expected = f"prod_{p_idx}_img_0.jpg"
            img_bytes = files_map.get(filename_expected)

            # Si el backend NO recibió archivo pero el JSON traía algo (fallback), 
            # podrías procesarlo, pero con FormData el binario manda.
            
            registro_db = SalidaMaterial(
                ruc=validated_data.ruc,
                cliente=validated_data.cliente,
                adicional=validated_data.adicional,
                serieNumGR=validated_data.serieNumGR,
                condicion=validated_data.condicion,
                fecha=validated_data.fecha,
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
                moneda=p.moneda,
                image_byte=img_bytes  # Guardamos los bytes directos del UploadFile
            )
            nuevos_registros.append(registro_db)

        # 4. Guardar en Base de Datos
        session.add_all(nuevos_registros)
        await session.commit()
        
        # Opcional: refrescar registros para devolver datos completos (IDs, etc)
        for r in nuevos_registros:
            await session.refresh(r)

        return nuevos_registros

    except IntegrityError as e:
        await session.rollback()
        logger.error(f"Error de integridad: {e}")
        raise HTTPException(status_code=400, detail="Error de integridad: Posible duplicado.")
    except Exception as e:
        await session.rollback()
        logger.error(f"Error procesando salida de material: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router_salidaMaterial.get("", response_model=List[RegistroSalidaMaterialOut])
async def listar_SalidaMaterial(session: AsyncSession = Depends(get_session)):
    stmt = select(SalidaMaterial).order_by(SalidaMaterial.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_salidaMaterial.delete("/{SalidaMaterial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_SalidaMaterial(SalidaMaterial_id: int, session: AsyncSession = Depends(get_session)):
    salidaMaterial = await session.get(SalidaMaterial, SalidaMaterial_id)
    if not salidaMaterial:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(salidaMaterial)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
