from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---- MIXINS Y CONFIGURACIÓN ----

class DateTimeUTCMixin:
    @field_validator("fecha", mode="before", check_fields=False)
    @classmethod
    def normalize_datetime(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            # Maneja formato ISO y el sufijo 'Z'
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

# Configuración base para modelos de salida
cfg_from_attributes = ConfigDict(from_attributes=True)

# ---- MODELO HISTORIAL COMPRAS ----

class HistorialComprasBase(BaseModel):
    fecha: datetime
    descripcion: str
    ruc: str
    proveedor: str
    tipo: str
    serie: str
    numero: int
    subtotal: float
    igv: float
    nograbada: float
    otros: float
    total: float
    tc: float

class HistorialComprasCreate(DateTimeUTCMixin, HistorialComprasBase):
    pass

class HistorialComprasUpdate(DateTimeUTCMixin, BaseModel):
    fecha: Optional[datetime] = None
    descripcion: Optional[str] = None
    ruc: Optional[str] = None
    proveedor: Optional[str] = None
    tipo: Optional[str] = None
    serie: Optional[str] = None
    numero: Optional[int] = None
    subtotal: Optional[float] = None
    igv: Optional[float] = None
    nograbada: Optional[float] = None
    otros: Optional[float] = None
    total: Optional[float] = None
    tc: Optional[float] = None

class HistorialComprasOut(HistorialComprasBase):
    model_config = cfg_from_attributes
    id: int
    created_at: datetime
