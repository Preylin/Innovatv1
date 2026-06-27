
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

class WeatherImportacion(BaseModel):
    nro_documento: texto_limpio
    razon_social: texto_limpio
    ubicacion: texto_limpio
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class WeatherCreate(BaseModel):
    cliente_id: int
    ubicacion_id: int
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class WeatherOut(BaseModel):
    id: int
    cliente_id: int
    nro_documento: str
    razon_social: str
    ubicacion_id: int
    ubicacion: str
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

    class Config:
        orm_mode = True

class WeatherUpdate(BaseModel):
    cliente_id: Optional[int]
    ubicacion_id: Optional[int]
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = "PENDIENTE"
    adicional: Optional[str] = None

class ActualizarEstadoSchema(BaseModel):
    estado: str




# clases consulta masiva

class WeatherMasiva(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = None
    adicional: Optional[str] = None    
    class Config:
        orm_mode = True

class ProMasiva(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = None
    adicional: Optional[str] = None
    class Config:
        orm_mode = True

class ChipsMasiva(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    numero_chip: str
    fact_relacionada: Optional[str] = None
    estado: Optional[str] = None
    adicional: Optional[str] = None
    
    class Config:
        orm_mode = True

class MCMasiva(BaseModel):
    id: int
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