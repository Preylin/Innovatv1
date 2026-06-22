from datetime import datetime
from typing import Self
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from pydantic import BaseModel, model_validator

from api.app.api.v1.administracion.monitoreo.individuales.models_weather_pro_chips_monitoreo_administracion import Weather
from core.db import get_session


class WeatherBase(BaseModel):
    name: str
    ubicacion: str
    inicio: datetime
    fin: datetime
    fact_rel: str | None = None
    adicional: str | None = None
    status: int

    @model_validator(mode='after')
    def verificar_fechas(self) -> Self:
        # Comparamos las fechas una vez que los campos individuales han sido validados
        if self.fin <= self.inicio:
            raise ValueError("La fecha de fin debe ser posterior a la de inicio")
        return self

class WeatherRead(WeatherBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

async def get_all_weather(db: AsyncSession) -> list[WeatherRead]:
    stmr = select(Weather)
    result = await db.execute(stmr)
    return result.scalars().all()


async def get_weather_by_id(db: AsyncSession, weather_id: int) -> WeatherRead:
    stmr = select(Weather).where(Weather.id == weather_id)
    result = await db.execute(stmr)
    return result.scalar_one_or_none()


async def create_weather_entry( db: AsyncSession, weather_data: WeatherBase) -> WeatherRead:
    new_weather = Weather(**weather_data.model_dump())

    try:
        db.add(new_weather)

        await db.commit()

        await db.refresh(new_weather)

        return new_weather
    
    except SQLAlchemyError as e:
        await db.rollback()
        raise e
    
async def update_weather(db: AsyncSession, weather_id: int, update_data: WeatherBase):
    result =  await db.execute(select(Weather).where(Weather.id == weather_id))
    db_weather = result.scalar_one_or_none()
    
    if db_weather:
        values_to_update = update_data.model_dump(exclude_unset=True)

        for key, value in values_to_update.items():
            setattr(db_weather, key, value)
        
        await db.commit()
        await db.refresh(db_weather)

    return db_weather

async def delete_weather(db: AsyncSession, weather_id: int) -> bool: 
    try:
        query = delete(Weather).where(Weather.id == weather_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    except SQLAlchemyError as e:
        await db.rollback
        return False
    

db_datos = get_all_weather(get_session())
print(db_datos)