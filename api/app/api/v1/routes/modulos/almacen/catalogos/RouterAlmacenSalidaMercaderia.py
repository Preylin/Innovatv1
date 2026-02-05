import base64
import binascii
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.modulos.almacen.catalogos.ModelsAlmacenSalidaMercaderia import SalidaMercaderia
from app.api.v1.schemas.modulos.almacen.catalogos.SchemaAlmacenSalidaMercaderia import RegistrarClienteRequestMercaderia, RegistroSalidaMercaderiaCreate, RegistroSalidaMercaderiaOut
from app.core.db import get_session
from app.core.deps import get_current_user

logger = logging.getLogger("uvicorn.error")

# ---------- HELPERS ----------

def decode_base64_image(data: Union[str, list, None]) -> Optional[bytes]:
    if not data: 
        return None
    
    # Manejo de la lista que envía tu frontend
    if isinstance(data, list) and data:
        img_obj = data[0]
        # Si es un objeto Pydantic o un dict
        data = getattr(img_obj, "image_byte", img_obj.get("image_byte") if isinstance(img_obj, dict) else None)
    
    if not isinstance(data, str): 
        return None

    try:
        if "base64," in data:
            data = data.split("base64,")[1]
        return base64.b64decode(data) # Esto retorna <bytes>
    except (binascii.Error, ValueError):
        return None
    

def transform_request_to_db_model_mercaderia(request_data: RegistrarClienteRequestMercaderia) -> List[RegistroSalidaMercaderiaCreate]:
    """
    Convierte el request anidado en una lista de modelos planos 
    compatibles con la tabla 'almacen.inventario'.
    """
    return [
        RegistroSalidaMercaderiaCreate(
            ruc=request_data.ruc,
            cliente=request_data.cliente,
            adicional=request_data.adicional,
            serieNumGR=request_data.serieNumGR,
            condicion=request_data.condicion,
            fecha=request_data.fecha,
            codigo=p.codigo,
            uuid_mercaderia=p.uuid_mercaderia,
            moneda=p.moneda,
            name=p.name,
            marca=p.marca,
            modelo=p.modelo,
            medida=p.medida,
            dimension=p.dimension,
            serie=p.serie,
            cantidad=p.cantidad,
            valor=p.valor,
            image_byte=decode_base64_image(p.image),
            categoria=p.categoria
        )
        for p in request_data.productos
    ]

router_salidaMercaderia = APIRouter(
    prefix="/salidaMercaderia",
    tags=["salidaMercaderia"],
    dependencies=[Depends(get_current_user)],
)

@router_salidaMercaderia.post("", response_model=List[RegistroSalidaMercaderiaOut], status_code=status.HTTP_201_CREATED)
async def crear_SalidaMercaderia(data: RegistrarClienteRequestMercaderia, session: AsyncSession = Depends(get_session)):
    try:
        # 1. Transformar datos de Pydantic a lista de diccionarios o modelos de SQLAlchemy
        productos_validados = transform_request_to_db_model_mercaderia(data)
        
        # 2. Convertir esquemas Pydantic a objetos de SQLAlchemy
        nuevos_registros = [
            SalidaMercaderia(**p.model_dump()) for p in productos_validados
        ]
        
        session.add_all(nuevos_registros)
        await session.commit()
        
        # Refrescar para obtener IDs y created_at
        return nuevos_registros
        
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"Error de integridad: {e}")
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos (posible RUC o Serie duplicada)")
    except Exception as e:
        await session.rollback()
        logger.error(f"Error inesperado: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

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
