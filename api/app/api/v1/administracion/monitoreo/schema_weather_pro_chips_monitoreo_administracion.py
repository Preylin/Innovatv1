from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone

# ---- HELPER / MIXIN ----
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

# Configuración compartida para modelos de salida (ORM Mode)
cfg_orm = ConfigDict(from_attributes=True)

# ---- CLASE BASE MAESTRA (Para evitar repetición) ----
class ServicioBase(BaseModel):
    name: str
    ubicacion: str
    inicio: datetime
    fin: datetime
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None

# ----- MODELO WEATHER -----

class WeatherBase(ServicioBase):
    """Hereda todos los campos de ServicioBase"""
    pass

class WeatherCreate(DateTimeUTCMixin, WeatherBase):
    status: int = Field(default=0)  # 0=pendiente, 1=renovado, 2=norenovado

class WeatherUpdate(DateTimeUTCMixin, BaseModel):
    name: Optional[str] = None
    ubicacion: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None
    status: Optional[int] = None

class WeatherOut(WeatherBase):
    model_config = cfg_orm
    id: int
    created_at: datetime
    status: int

# ---- MODELO PRO ----

class ProBase(ServicioBase):
    """Hereda todos los campos de ServicioBase"""
    pass

class ProCreate(DateTimeUTCMixin, ProBase):
    status: int = Field(default=0)  # 0=pendiente, 1=renovado, 2=norenovado

class ProUpdate(DateTimeUTCMixin, BaseModel):
    name: Optional[str] = None
    ubicacion: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None
    status: Optional[int] = None

class ProOut(ProBase):
    model_config = cfg_orm
    id: int
    created_at: datetime
    status: int

# ---- MODELO CHIPS ----

class ChipServicioBase(ServicioBase):
    """Hereda todos los campos de ServicioBase"""
    pass

class ChipServicioCreate(DateTimeUTCMixin, ChipServicioBase):
    numero: str
    operador: str
    plan: str
    status: int = Field(default=0)  # 0=pendiente, 1=renovado, 2=norenovado

class ChipServicioUpdate(DateTimeUTCMixin, BaseModel):
    name: Optional[str] = None
    ubicacion: Optional[str] = None
    numero: Optional[str] = None
    operador: Optional[str] = None
    plan: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    fact_rel: Optional[str] = None
    adicional: Optional[str] = None
    status: Optional[int] = None

class ChipServicioOut(ChipServicioBase):
    model_config = cfg_orm
    id: int
    numero: str
    operador: str
    plan: str
    created_at: datetime
    status: int