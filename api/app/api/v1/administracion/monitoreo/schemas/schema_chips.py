
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict, field_validator
from datetime import date
from typing import Annotated, Optional
from app.helpers.limpiarStrings import limpiar_texto

texto_limpio = Annotated[Optional[str], BeforeValidator(limpiar_texto)]

class CreateCliente(BaseModel):
    tipo_documento: Optional[str] = "6"
    nro_documento: texto_limpio
    razon_social: texto_limpio

class CreateUbicacion(BaseModel):
    ubicacion: texto_limpio

class ChipsImportacion(BaseModel):
    nro_documento: texto_limpio
    razon_social: texto_limpio
    ubicacion: texto_limpio
    numero: str
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class ChipsCreate(BaseModel):
    cliente_id: int
    ubicacion_id: int
    chip_id: int
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class ChipsOut(BaseModel):
    id: int
    cliente_id: int
    nro_documento: str
    razon_social: str
    ubicacion_id: int
    ubicacion: str
    chip_id: int
    numero_chip: str
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

    class Config:
        model_config = ConfigDict(from_attributes=True)

class ChipsUpdate(BaseModel):
    cliente_id: Optional[int]
    ubicacion_id: Optional[int]
    chip_id: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class ActualizarEstadoSchema(BaseModel):
    estado: str

class ChipsCalendarioVencimientosApiSchema(BaseModel):
    fecha_fin: date

    class Config:
        model_config = ConfigDict(from_attributes=True)