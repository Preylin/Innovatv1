from pydantic import BaseModel, BeforeValidator, Field, ConfigDict, field_validator
from datetime import date
from typing import Annotated, Optional
from app.helpers.limpiarStrings import limpiar_texto

texto_limpio = Annotated[Optional[str], BeforeValidator(limpiar_texto)]

class ClienteOutShort(BaseModel):
    id: int
    nro_documento: str
    razon_social: str

    class Config:
        orm_mode = True

class UbicacionOut(BaseModel):
    id: int
    ubicacion: str
    
    class Config:
        orm_mode = True