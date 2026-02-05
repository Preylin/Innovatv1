import base64
import binascii
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.modulos.almacen.catalogos.ModelsAlmacenIngresoMaterial import IngresoMaterial
from app.api.v1.schemas.modulos.almacen.catalogos.SchemaAlmacenIngresoMaterial import RegistrarProveedorRequestMaterial, RegistroIngresoMaterialCreate, RegistroIngresoMaterialOut, StockActualMaterialDetallado, StockActualLimitMaterial
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
    

def transform_request_to_db_model_Material(request_data: RegistrarProveedorRequestMaterial) -> List[RegistroIngresoMaterialCreate]:
    """
    Convierte el request anidado en una lista de modelos planos 
    compatibles con la tabla 'almacen.inventario'.
    """
    return [
        RegistroIngresoMaterialCreate(
            ruc=request_data.ruc,
            proveedor=request_data.proveedor,
            serieNumCP=request_data.serieNumCP,
            serieNumGR=request_data.serieNumGR,
            condicion=request_data.condicion,
            fecha=request_data.fecha,
            moneda=request_data.moneda,
            codigo=p.codigo,
            uuid_material=p.uuid_material,
            name=p.name,
            marca=p.marca,
            modelo=p.modelo,
            medida=p.medida,
            dimension=p.dimension,
            serie=p.serie,
            cantidad=p.cantidad,
            valor=p.valor,
            image_byte=decode_base64_image(p.image),
            tipo=p.tipo,
            ubicacion=p.ubicacion
        )
        for p in request_data.productos
    ]

router_ingresoMaterial = APIRouter(
    prefix="/ingresoMaterial",
    tags=["ingresoMaterial"],
    dependencies=[Depends(get_current_user)],
)

@router_ingresoMaterial.post("", response_model=List[RegistroIngresoMaterialOut], status_code=status.HTTP_201_CREATED)
async def crear_ingresoMaterial(data: RegistrarProveedorRequestMaterial, session: AsyncSession = Depends(get_session)):
    try:
        # 1. Transformar datos de Pydantic a lista de diccionarios o modelos de SQLAlchemy
        productos_validados = transform_request_to_db_model_Material(data)
        
        # 2. Convertir esquemas Pydantic a objetos de SQLAlchemy
        nuevos_registros = [
            IngresoMaterial(**p.model_dump()) for p in productos_validados
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
