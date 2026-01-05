from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import field_validator


# ----HELPER----
class DateTimeUTCMixin:
    @field_validator("inicio", "fin", mode="before", check_fields=False)
    @classmethod
    def normalize_datetime(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)
    

#----- MODELO WEATHER ----

class WeatherBase(BaseModel):
    name: str
    ubicacion: str
    inicio: datetime
    fin: datetime
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None

class WeatherCreate(DateTimeUTCMixin, WeatherBase):
    status: int = Field(default=0)
# los valores de status son 0=pendiente, 1=renovado y 2=norenovado

class WeatherUpdate(DateTimeUTCMixin, BaseModel):
    name: Optional[str] = None
    ubicacion: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None
    status: Optional[int] = None

class WeatherOut(WeatherBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    status: int



# ---- PRO ----

class ProBase(BaseModel):
    name: str
    ubicacion: str
    inicio: datetime
    fin: datetime
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None

class ProCreate(DateTimeUTCMixin, ProBase):
    status: int = Field(default=0)
# los valores de status son 0=pendiente, 1=renovado y 2=norenovado

class ProUpdate(DateTimeUTCMixin, BaseModel):
    name: Optional[str] = None
    ubicacion: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None
    status: Optional[int] = None

class ProOut(ProBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    status: int