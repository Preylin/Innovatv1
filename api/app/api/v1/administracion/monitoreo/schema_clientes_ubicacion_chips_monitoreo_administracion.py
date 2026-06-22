import base64
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---- MIXINS Y CONFIGURACIÓN ----

class DateTimeUTCMixin:
    @field_validator("activacion", "instalacion", mode="before", check_fields=False)
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

# ---- MODELO DE UBICACIONES ----

class UbicacionBase(BaseModel):
    name: str

class UbicacionCreate(BaseModel):
    cliente_id: int
    ubicaciones: List[UbicacionBase] = Field(..., min_length=1)

class UbicacionUpdate(BaseModel):
    name: Optional[str] = None

class UbicacionOut(UbicacionBase):
    model_config = cfg_from_attributes
    id: int
    cliente_id: int
    created_at: datetime

# ---- MODELO DE CLIENTE ----

class ClienteBase(BaseModel):
    ruc: str
    name: str

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    ruc: Optional[str] = None
    name: Optional[str] = None
    ubicaciones: Optional[List[UbicacionBase]] = None

class ClienteOut(ClienteBase):
    model_config = cfg_from_attributes
    id: int
    ubicaciones: List[UbicacionOut] = Field(
        default_factory=list, 
        validation_alias='ubicacion' 
    )
    created_at: datetime

    @field_validator('ruc', mode='before')
    @classmethod
    def transform_ruc_to_str(cls, v):
        if v is None:
            return v
        return str(v)


# ---- MODELO CHIPS ----

class ChipBase(BaseModel):
    numero: int
    iccid: str
    operador: str
    mb: str

class ChipCreate(DateTimeUTCMixin, ChipBase):
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    status: int = 0  # 0=stock, 1=activo, 2=baja

class ChipUpdate(DateTimeUTCMixin, BaseModel): 
    numero: Optional[int] = None
    iccid: Optional[str] = None
    operador: Optional[str] = None
    mb: Optional[str] = None
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    status: Optional[int] = None

class ChipOut(ChipBase):
    model_config = cfg_from_attributes
    id: int
    activacion: Optional[datetime]
    instalacion: Optional[datetime]
    adicional: Optional[str]
    status: int
    imagen1: Optional[str]
    imagen2: Optional[str]
    created_at: datetime

    @field_validator("imagen1", "imagen2", mode="before")
    @classmethod
    def bytes_to_base64(cls, v):
        """Convierte automáticamente cualquier campo de imagen de bytes a base64."""
        if isinstance(v, bytes):
            return base64.b64encode(v).decode("utf-8")
        return v


class ChipImportSchema(DateTimeUTCMixin, ChipBase):
    """Hereda de ChipBase para evitar repetir campos de texto/int"""
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    status: int = Field(default=0)
    
    model_config = ConfigDict(extra="forbid")