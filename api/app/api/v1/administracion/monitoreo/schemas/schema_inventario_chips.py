
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict, field_validator
from datetime import date
from typing import Annotated, Optional
from app.helpers.limpiarStrings import limpiar_texto

texto_limpio = Annotated[Optional[str], BeforeValidator(limpiar_texto)]

class CreateIventarioChipsImportacion(BaseModel):
    numero_chip: texto_limpio
    iccid: texto_limpio
    operador: texto_limpio
    plan: texto_limpio
    fecha_activacion: Optional[date] = None
    fecha_instalacion: Optional[date] = None
    adicional: Optional[str] = None

class IventarioChipsOut(BaseModel):
    id: int
    numero_chip: str
    iccid: Optional[str] = None
    operador: Optional[str] = None
    plan: Optional[str] = None
    fecha_activacion: Optional[date] = None
    fecha_instalacion: Optional[date] = None
    adicional: Optional[str] = None

    class Config:
        model_config = ConfigDict(from_attributes=True)

class CreateChipInventario(BaseModel):
    numero_chip: str
    iccid: Optional[str] = None
    operador: Optional[str] = None
    plan: Optional[str] = None
    fecha_activacion: Optional[date] = None
    fecha_instalacion: Optional[date] = None
    adicional: Optional[str] = None

class ChipInventarioUpdate(BaseModel):
    numero_chip: Optional[str] = None
    iccid: Optional[str] = None
    operador: Optional[str] = None
    plan: Optional[str] = None
    fecha_activacion: Optional[date] = None
    fecha_instalacion: Optional[date] = None
    adicional: Optional[str] = None 

class ChipDeleteSoft(BaseModel):
    is_active: bool = False