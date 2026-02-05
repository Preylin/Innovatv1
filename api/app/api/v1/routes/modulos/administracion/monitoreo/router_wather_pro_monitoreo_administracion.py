import logging
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.modulos.administracion.monitoreo.individuales.models_weather_pro_chips_monitoreo_administracion import ChipServicio, Weather, Pro
from app.api.v1.schemas.modulos.administracion.monitoreo.schema_weather_pro_chips_monitoreo_administracion import (
    ChipServicioOut, ProUpdate, WeatherCreate, WeatherOut, ProCreate, ProOut, WeatherUpdate, ChipServicioCreate, ChipServicioUpdate
)

logger = logging.getLogger("uvicorn.error")

# --- ROUTER WEATHER ---

router_weather = APIRouter(
    prefix="/weather",
    tags=["weather"],
    dependencies=[Depends(get_current_user)],
)

@router_weather.post("", response_model=WeatherOut, status_code=status.HTTP_201_CREATED)
async def crear_weather(data: WeatherCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Weather(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al crear")

@router_weather.get("", response_model=List[WeatherOut])
async def listar_weather(session: AsyncSession = Depends(get_session)):
    stmt = select(Weather).order_by(Weather.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_weather.put("/{weather_id}", response_model=WeatherOut)
async def actualizar_weather(
    weather_id: int, 
    payload: WeatherUpdate = Body(...), 
    session: AsyncSession = Depends(get_session)
):
    weather = await session.get(Weather, weather_id)
    if not weather:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return weather

    try:
        for key, value in data.items():
            setattr(weather, key, value)
        
        await session.commit()
        await session.refresh(weather)
        return weather
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error actualizando weather {weather_id}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar")

@router_weather.delete("/{weather_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_weather(weather_id: int, session: AsyncSession = Depends(get_session)):
    weather = await session.get(Weather, weather_id)
    if not weather:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        await session.delete(weather)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar por restricciones de integridad")


# --- ROUTER PRO ---

router_pro = APIRouter(
    prefix="/pro",
    tags=["pro"],
    dependencies=[Depends(get_current_user)],
)

@router_pro.post("", response_model=ProOut, status_code=status.HTTP_201_CREATED)
async def crear_pro(data: ProCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Pro(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al crear")

@router_pro.get("", response_model=List[ProOut])
async def listar_pro(session: AsyncSession = Depends(get_session)):
    stmt = select(Pro).order_by(Pro.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_pro.put("/{pro_id}", response_model=ProOut)
async def actualizar_pro(
    pro_id: int, 
    payload: ProUpdate = Body(...), 
    session: AsyncSession = Depends(get_session)
):
    pro = await session.get(Pro, pro_id)
    if not pro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return pro

    try:
        for key, value in data.items():
            setattr(pro, key, value)
            
        await session.commit()
        await session.refresh(pro)
        return pro
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error actualizando pro {pro_id}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar")

@router_pro.delete("/{pro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_pro(pro_id: int, session: AsyncSession = Depends(get_session)):
    pro = await session.get(Pro, pro_id)
    if not pro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        await session.delete(pro)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar por restricciones de integridad")

router_chipservicio = APIRouter(
    prefix="/chipservicio",
    tags=["chipservicio"],
    dependencies=[Depends(get_current_user)],
)

@router_chipservicio.post("", response_model=ChipServicioOut, status_code=status.HTTP_201_CREATED)
async def crear_chipservicio(data: ChipServicioCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = ChipServicio(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al crear")

@router_chipservicio.get("", response_model=List[ChipServicioOut])
async def listar_chipservicio(session: AsyncSession = Depends(get_session)):
    stmt = select(ChipServicio).order_by(ChipServicio.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_chipservicio.put("/{chipservicio_id}", response_model=ChipServicioOut)
async def actualizar_chipservicio(
    chipservicio_id: int,
    payload: ChipServicioUpdate = Body(...),
    session: AsyncSession = Depends(get_session)
):
    chipservicio = await session.get(ChipServicio, chipservicio_id)
    if not chipservicio:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    data = payload.model_dump(exclude_unset=True)
    if not data:
        return chipservicio
    
    try:
        for key, value in data.items():
            setattr(chipservicio, key, value)
        
        await session.commit()
        await session.refresh(chipservicio)
        return chipservicio
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error actualizando chipservicio {chipservicio_id}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar")

@router_chipservicio.delete("/{chipservicio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_chipservicio(chipservicio_id: int, session: AsyncSession = Depends(get_session)):
    chipservicio = await session.get(ChipServicio, chipservicio_id)
    if not chipservicio:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        await session.delete(chipservicio)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar por restricciones de integridad")