import base64
import binascii
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.modulos.almacen.catalogos.ModelsAlmacenSalidaMaterial import SalidaMaterial
from app.api.v1.schemas.modulos.almacen.catalogos.SchemaAlmacenSalidaMaterial import RegistrarClienteRequestMaterial, RegistroSalidaMaterialCreate, RegistroSalidaMaterialOut
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
    

def transform_request_to_db_model_Material(request_data: RegistrarClienteRequestMaterial) -> List[RegistroSalidaMaterialCreate]:
    """
    Convierte el request anidado en una lista de modelos planos 
    compatibles con la tabla 'almacen.inventario'.
    """
    return [
        RegistroSalidaMaterialCreate(
            ruc=request_data.ruc,
            cliente=request_data.cliente,
            adicional=request_data.adicional,
            serieNumGR=request_data.serieNumGR,
            condicion=request_data.condicion,
            fecha=request_data.fecha,
            codigo=p.codigo,
            uuid_material=p.uuid_material,
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
            tipo=p.tipo
        )
        for p in request_data.productos
    ]

router_salidaMaterial = APIRouter(
    prefix="/salidaMaterial",
    tags=["salidaMaterial"],
    dependencies=[Depends(get_current_user)],
)

@router_salidaMaterial.post("", response_model=List[RegistroSalidaMaterialOut], status_code=status.HTTP_201_CREATED)
async def crear_SalidaMaterial(data: RegistrarClienteRequestMaterial, session: AsyncSession = Depends(get_session)):
    try:
        # 1. Transformar datos de Pydantic a lista de diccionarios o modelos de SQLAlchemy
        productos_validados = transform_request_to_db_model_Material(data)
        
        # 2. Convertir esquemas Pydantic a objetos de SQLAlchemy
        nuevos_registros = [
            SalidaMaterial(**p.model_dump()) for p in productos_validados
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
