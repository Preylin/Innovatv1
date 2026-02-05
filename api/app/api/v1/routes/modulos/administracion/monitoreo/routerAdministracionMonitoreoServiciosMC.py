import logging
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.modulos.administracion.monitoreo.individuales.modelsAdministracionMonitoreoServiciosMc import ServicioMC
from app.api.v1.schemas.modulos.administracion.monitoreo.schemaAdministracionMonitorServiciosMC import ServicioMCCreate, ServicioMCOut, ServicioMCUpdate

logger = logging.getLogger("uvicorn.error")

router_serviciosmc = APIRouter(
    prefix="/serviciosmc",
    tags=["serviciosmc"],
    dependencies=[Depends(get_current_user)],
)

@router_serviciosmc.post("", response_model=ServicioMCOut, status_code=status.HTTP_201_CREATED)
async def crear_serviciosmc(data: ServicioMCCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = ServicioMC(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al crear")

@router_serviciosmc.get("", response_model=List[ServicioMCOut])
async def listar_serviciosmc(session: AsyncSession = Depends(get_session)):
    stmt = select(ServicioMC).order_by(ServicioMC.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_serviciosmc.put("/{serviciosmc_id}", response_model=ServicioMCOut)
async def actualizar_serviciosmc(
    serviciosmc_id: int, 
    payload: ServicioMCUpdate = Body(...), 
    session: AsyncSession = Depends(get_session)
):
    serviciosmc = await session.get(ServicioMC, serviciosmc_id)
    if not serviciosmc:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return serviciosmc

    try:
        for key, value in data.items():
            setattr(serviciosmc, key, value)
        
        await session.commit()
        await session.refresh(serviciosmc)
        return serviciosmc
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error actualizando serviciosmc {serviciosmc_id}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar")

@router_serviciosmc.delete("/{serviciosmc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_serviciosmc(serviciosmc_id: int, session: AsyncSession = Depends(get_session)):
    serviciosmc = await session.get(ServicioMC, serviciosmc_id)
    if not serviciosmc:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        await session.delete(serviciosmc)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar por restricciones de integridad")
