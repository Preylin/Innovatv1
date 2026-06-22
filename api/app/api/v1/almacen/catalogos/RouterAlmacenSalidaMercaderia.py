import base64
import binascii
import json
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.almacen.catalogos.ModelsAlmacenSalidaMercaderia import SalidaMercaderia
from app.api.v1.almacen.catalogos.SchemaAlmacenSalidaMercaderia import RegistrarClienteRequestMercaderia, RegistroSalidaMercaderiaCreate, RegistroSalidaMercaderiaOut
from app.core.db import get_session
from app.core.deps import get_current_user

logger = logging.getLogger("uvicorn.error")

router_salidaMercaderia = APIRouter(
    prefix="/salidaMercaderia",
    tags=["salidaMercaderia"],
    dependencies=[Depends(get_current_user)],
)

@router_salidaMercaderia.post("", response_model=List[RegistroSalidaMercaderiaOut], status_code=status.HTTP_201_CREATED)
async def crear_SalidaMercaderia(
    data: str = Form(...), # Recibe el JSON string
    files: List[UploadFile] = File(None), # Recibe la lista de imágenes
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Parsear el JSON manual y validar con Pydantic
        try:
            raw_json = json.loads(data)
            validated_data = RegistrarClienteRequestMercaderia(**raw_json)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error en formato JSON: {str(e)}")

        # 2. Mapear archivos por su nombre de campo para búsqueda rápida
        # El frontend envía: prod_{pIdx}_img_{iIdx}.jpg
        files_map = {f.filename: await f.read() for f in (files or [])}
        
        nuevos_registros = []

        # 3. Procesar productos (Aplanamiento de datos)
        for p_idx, p in enumerate(validated_data.productos):
            # En Salida de Mercadería, si el producto tiene múltiples imágenes:
            # Si solo guardas una imagen por fila de DB, aquí buscamos la correspondiente
            # O si el producto es una sola fila con una lista de imágenes, ajustamos:
            
            # Buscamos la primera imagen del producto (basado en el índice del frontend)
            filename_expected = f"prod_{p_idx}_img_0.jpg" 
            img_bytes = files_map.get(filename_expected)

            registro_db = SalidaMercaderia(
                ruc=validated_data.ruc,
                cliente=validated_data.cliente,
                adicional=validated_data.adicional,
                serieNumGR=validated_data.serieNumGR,
                condicion=validated_data.condicion,
                fecha=validated_data.fecha,
                # Datos del producto
                uuid_mercaderia=p.uuid_mercaderia,
                codigo=p.codigo,
                moneda=p.moneda,
                name=p.name,
                marca=p.marca,
                modelo=p.modelo,
                medida=p.medida,
                dimension=p.dimension,
                serie=p.serie,
                cantidad=p.cantidad,
                valor=p.valor,
                categoria=p.categoria,
                image_byte=img_bytes # Guardamos los bytes directos
            )
            nuevos_registros.append(registro_db)

        # 4. Guardar en Base de Datos
        session.add_all(nuevos_registros)
        await session.commit()
        
        # Opcional: refrescar si necesitas los IDs generados por la DB
        return nuevos_registros

    except IntegrityError as e:
        await session.rollback()
        logger.error(f"Error de integridad: {e}")
        raise HTTPException(status_code=400, detail="Error de integridad: Posible duplicado.")
    except Exception as e:
        await session.rollback()
        logger.error(f"Error procesando salida: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router_salidaMercaderia.get("", response_model=List[RegistroSalidaMercaderiaOut])
async def listar_SalidaMercaderia(session: AsyncSession = Depends(get_session)):
    stmt = select(SalidaMercaderia).order_by(SalidaMercaderia.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_salidaMercaderia.delete("/{salidaMercaderia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_SalidaMercaderia(salidaMercaderia_id: int, session: AsyncSession = Depends(get_session)):
    salidaMercaderia = await session.get(SalidaMercaderia, salidaMercaderia_id)
    if not salidaMercaderia:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(salidaMercaderia)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
