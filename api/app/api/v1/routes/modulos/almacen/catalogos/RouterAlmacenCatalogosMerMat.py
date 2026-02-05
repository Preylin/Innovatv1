import base64
import binascii
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.deps import get_current_user

from app.models.modulos.almacen.catalogos.ModelsAlmacenCatalogosMerMat import CatalogoMaterial, CatalogoMercaderia
from app.api.v1.schemas.modulos.almacen.catalogos.SchemaAlmacenCatalagosMerMat import CatalogoMercaderiaCreate, CatalogoMercaderiaUpdate, CatalogoMercaderiaOut, CatalogoMaterialCreate, CatalogoMaterialUpdate, CatalogoMaterialOut


logger = logging.getLogger("uvicorn.error")

# ---------- HELPERS ----------

def decode_base64_image(data: Union[str, list, None]) -> Optional[bytes]:
    if not data: return None
    if isinstance(data, list) and data:
        img_obj = data[0]
        data = getattr(img_obj, "image_byte", img_obj.get("image_byte") if isinstance(img_obj, dict) else None)
    if not isinstance(data, str): return None
    try:
        if "base64," in data:
            data = data.split("base64,")[1]
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        return None

# ---------- CATALOGO MERCADERIA ----------
router_catalogoMercaderia = APIRouter(
    prefix="/catalogoMercaderia",
    tags=["catalogoMercaderia"],
    dependencies=[Depends(get_current_user)],
)

@router_catalogoMercaderia.post("", response_model=CatalogoMercaderiaOut, status_code=status.HTTP_201_CREATED)
async def crear_catalogoMercaderia(data: CatalogoMercaderiaCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = CatalogoMercaderia(
            codigo=data.codigo,
            name=data.name,
            marca=data.marca,
            modelo=data.modelo,
            medida=data.medida,
            categoria=data.categoria,
            plimit=data.plimit,
            dimension=data.dimension,
            descripcion=data.descripcion,
            imagen1=decode_base64_image(data.imagen1),
            imagen2=decode_base64_image(data.imagen2),
            imagen3=decode_base64_image(data.imagen3),
            imagen4=decode_base64_image(data.imagen4),
        )
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED, detail=[
            {"loc": ["body", "codigo"], "msg": "Código duplicado", "type": "value_error"},
        ])

@router_catalogoMercaderia.get("", response_model=List[CatalogoMercaderiaOut])
async def listar_catalogoMercaderia(session: AsyncSession = Depends(get_session)):
    stmt = select(CatalogoMercaderia).order_by(CatalogoMercaderia.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_catalogoMercaderia.put("/{catalogoMercaderia_id}", response_model=CatalogoMercaderiaOut)
async def actualizar_catalogoMercaderia(
    catalogoMercaderia_id: int, 
    payload: CatalogoMercaderiaUpdate = Body(...), 
    session: AsyncSession = Depends(get_session)
):
    catalogoMercaderia = await session.get(CatalogoMercaderia, catalogoMercaderia_id)
    if not catalogoMercaderia:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    
    try:
        for key, value in data.items():
            # Si el campo empieza por 'imagen', aplicamos la decodificación
            if key.startswith("imagen") and value is not None:
                value = decode_base64_image(value)
            
            setattr(catalogoMercaderia, key, value)
        
        await session.commit()
        await session.refresh(catalogoMercaderia)
        return catalogoMercaderia
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar")


@router_catalogoMercaderia.delete("/{catalogoMercaderia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_catalogoMercaderia(catalogoMercaderia_id: int, session: AsyncSession = Depends(get_session)):
    catalogoMercaderia = await session.get(CatalogoMercaderia, catalogoMercaderia_id)
    if not catalogoMercaderia:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(catalogoMercaderia)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar por restricciones de integridad")

# ---------- CATALOGO MATERIAL ----------

router_catalogoMaterial = APIRouter(
    prefix="/catalogoMaterial",
    tags=["catalogoMaterial"],
    dependencies=[Depends(get_current_user)],
)

@router_catalogoMaterial.post("", response_model=CatalogoMaterialOut, status_code=status.HTTP_201_CREATED)
async def crear_catalogoMaterial(data: CatalogoMaterialCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = CatalogoMaterial(
            codigo=data.codigo,
            name=data.name,
            marca=data.marca,
            modelo=data.modelo,
            medida=data.medida,
            tipo=data.tipo,
            plimit=data.plimit,
            dimension=data.dimension,
            descripcion=data.descripcion,
            imagen1=decode_base64_image(data.imagen1),
            imagen2=decode_base64_image(data.imagen2),
            imagen3=decode_base64_image(data.imagen3),
            imagen4=decode_base64_image(data.imagen4),
        )
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED, detail=[
            {"loc": ["body", "codigo"], "msg": "Código duplicado", "type": "value_error"},
        ])

@router_catalogoMaterial.get("", response_model=List[CatalogoMaterialOut])
async def listar_catalogoMaterial(session: AsyncSession = Depends(get_session)):
    stmt = select(CatalogoMaterial).order_by(CatalogoMaterial.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_catalogoMaterial.put("/{catalogoMaterial_id}", response_model=CatalogoMaterialOut)
async def actualizar_catalogoMaterial(
    catalogoMaterial_id: int, 
    payload: CatalogoMaterialUpdate = Body(...), 
    session: AsyncSession = Depends(get_session)
):
    catalogoMaterial = await session.get(CatalogoMaterial, catalogoMaterial_id)
    if not catalogoMaterial:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)

    try:
        for key, value in data.items():
            if key.startswith("imagen") and value is not None:
                value = decode_base64_image(value)
            
            setattr(catalogoMaterial, key, value)
        
        await session.commit()
        await session.refresh(catalogoMaterial)
        return catalogoMaterial
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar")

@router_catalogoMaterial.delete("/{catalogoMaterial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_catalogoMaterial(catalogoMaterial_id: int, session: AsyncSession = Depends(get_session)):
    catalagoMaterial = await session.get(CatalogoMaterial, catalogoMaterial_id)
    if not catalagoMaterial:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(catalagoMaterial)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
