import logging
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.modulos.administracion.monitoreo.individuales.models_weather_pro_chips_monitoreo_administracion import Weather, Pro
from app.api.v1.schemas.modulos.administracion.monitoreo.schema_weather_pro_chips_monitoreo_administracion import ProUpdate, WeatherCreate, WeatherOut, ProCreate, ProOut, WeatherUpdate



logger = logging.getLogger("uvicorn.error")

router_weather = APIRouter(
    prefix="/weather",
    tags=["weather"],
    dependencies=[Depends(get_current_user)],
)

@router_weather.post("", response_model=WeatherOut, status_code=status.HTTP_201_CREATED)
async def crear_weather(
    data: WeatherCreate,
    session: AsyncSession = Depends(get_session),
):
    try:
        nuevo = Weather(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)

        return WeatherOut.model_validate(nuevo)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400)


@router_weather.get("", response_model=list[WeatherOut])
async def listar_weather(session: AsyncSession = Depends(get_session)):
    stmt = select(Weather).order_by(Weather.id)
    result = await session.execute(stmt)
    weather = result.scalars().all()
    return [WeatherOut(**w.__dict__) for w in weather]

@router_weather.delete("/{weather_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_weather(weather_id: int, session: AsyncSession = Depends(get_session)):
    weather = await session.get(Weather, weather_id)
    if not weather:
        raise HTTPException(status_code=404, detail="Weather no encontrado")

    try:
        await session.delete(weather)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar")

@router_weather.put("/{weather_id}", response_model=WeatherOut)
async def actualizar_weather(weather_id: int, payload: WeatherUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    stmt = select(Weather).where(Weather.id == weather_id)
    result = await session.execute(stmt)
    weather = result.scalar_one_or_none()

    if not weather:
        raise HTTPException(status_code=404, detail="Weather no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return WeatherOut.model_validate(weather)

    try:
        for fld in ("name", "ubicacion", "inicio", "fin", "fact_rel", "adicional", "status"):
            if fld not in data:
                continue
            setattr(weather, fld, data[fld])

        await session.commit()
        await session.refresh(weather)

    except Exception as e:
        await session.rollback()
        logger.exception("Error actualizando weather")
        raise HTTPException(status_code=500, detail="No se pudo actualizar el weather") from e

    return WeatherOut.model_validate(weather)


# ----- PRO -----

router_pro = APIRouter(
    prefix="/pro",
    tags=["pro"],
    dependencies=[Depends(get_current_user)],
)

@router_pro.post("", response_model=ProOut, status_code=status.HTTP_201_CREATED)
async def crear_pro(
    data: ProCreate,
    session: AsyncSession = Depends(get_session),
):
    try:
        nuevo = Pro(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)

        return ProOut.model_validate(nuevo)
    
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400)
    
@router_pro.get("", response_model=list[ProOut])
async def listar_pro(session: AsyncSession = Depends(get_session)):
    stmt = select(Pro).order_by(Pro.id)
    result = await session.execute(stmt)
    pro = result.scalars().all()
    return [ProOut(**p.__dict__) for p in pro]

@router_pro.delete("/{pro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_pro(pro_id: int, session: AsyncSession = Depends(get_session)):
    pro = await session.get(Pro, pro_id)
    if not pro:
        raise HTTPException(status_code=404, detail="Pro no encontrado")
    
    try:
        await session.delete(pro)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar")
    
@router_pro.put("/{pro_id}", response_model=ProOut)
async def actualizar_pro(pro_id: int, payload: ProUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    stmt = select(Pro).where(Pro.id == pro_id)
    result = await session.execute(stmt)
    pro = result.scalar_one_or_none()

    if not pro:
        raise HTTPException(status_code=404, detail="Pro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return ProOut.model_validate(pro)
    
    try:
        for fld in ("name", "ubicacion", "inicio", "fin", "fact_rel", "adicional", "status"):
            if fld not in data:
                continue
            setattr(pro, fld, data[fld])
        
        await session.commit()
        await session.refresh(pro)
    
    except Exception as e:
        await session.rollback()
        logger.exception("Error actualizando pro")
        raise HTTPException(status_code=500, detail="No se pudo actualizar el pro") from e
    
    return ProOut.model_validate(pro)