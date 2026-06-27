
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

class MCImportacion(BaseModel):
    nro_documento: texto_limpio
    razon_social: texto_limpio
    ubicacion: texto_limpio
    fecha_inicio: date
    fecha_fin: date
    servicio: texto_limpio
    informe: Optional[str] = None
    certificado: Optional[str] = None
    encargado: texto_limpio
    tecnico: texto_limpio
    estado: Optional[str] = "PENDIENTE"
    incidencia: Optional[str] = None

class MCCreate(BaseModel):
    cliente_id: int
    ubicacion_id: int
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    informe: Optional[str] = None
    certificado: Optional[str] = None
    encargado: Optional[str] = None
    tecnico: Optional[str] = None
    servicio: Optional[str] = None
    incidencia: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"

class MCOut(BaseModel):
    id: int
    cliente_id: int
    nro_documento: str
    razon_social: str
    ubicacion_id: int
    ubicacion: str
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    informe: Optional[str] = None
    certificado: Optional[str] = None
    encargado: Optional[str] = None
    tecnico: Optional[str] = None
    servicio: Optional[str] = None
    incidencia: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"

    class Config:
        orm_mode = True

class MCUpdate(BaseModel):
    cliente_id: Optional[int]
    ubicacion_id: Optional[int]
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    fact_relacionada: Optional[str] = None
    informe: Optional[str] = None
    certificado: Optional[str] = None
    encargado: Optional[str] = None
    tecnico: Optional[str] = None
    servicio: Optional[str] = None
    incidencia: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"

class ActualizarEstadoSchema(BaseModel):
    estado: str