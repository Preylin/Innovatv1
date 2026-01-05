from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import field_validator


# ----MODELO DE UBICACIONES----

class UbicacionBase(BaseModel):
    name: str

class UbicacionCreate(BaseModel):
    cliente_id: int
    ubicaciones: List[UbicacionBase] = Field(..., min_length=1)


class UbicacionUpdate(BaseModel):
    name: Optional[str] = None

class UbicacionOut(UbicacionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cliente_id: int
    created_at: datetime

# ----MODELO DE CLIENTE ----

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
    model_config = ConfigDict(from_attributes=True)

    id: int
    ubicaciones: list[UbicacionOut] = Field(default_factory=list)
    created_at: datetime


#---- MODELO DE IMAGEN CHIPS ----

class ImagenChipsBase(BaseModel):
    image_byte: str

class ImagenChipsCreate(ImagenChipsBase):
    pass

class ImagenChipsUpdate(BaseModel):
    image_byte: Optional[str] = Field(default=None, repr=False)

class ImagenChipsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chip_id: int
    image_base64: str
    created_at: datetime

# ----MODELO CHIPS----

class DateTimeUTCMixin:
    @field_validator("activacion", "instalacion", mode="before", check_fields=False)
    @classmethod
    def normalize_datetime(cls, v):
        if v is None:
            return v

        if isinstance(v, str):
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))

        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)

        return v.astimezone(timezone.utc)


class ChipBase(BaseModel):
    numero: int
    iccid: str
    operador: str
    mb: str


class ChipCreate(DateTimeUTCMixin, ChipBase):
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    image_byte: List[ImagenChipsCreate] = Field(default_factory=list)
    status: int = 0
# los valores de status son 0=stock, 1=online y 2=baja 


class ChipUpdate(DateTimeUTCMixin, BaseModel): 
    numero: Optional[int] = None
    iccid: Optional[str] = None
    operador: Optional[str] = None
    mb: Optional[str] = None
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    image_byte: Optional[List[ImagenChipsUpdate]] = None

class ChipOut(ChipBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activacion: Optional[datetime]
    instalacion: Optional[datetime]
    adicional: Optional[str]
    status: int
    imagen: List[ImagenChipsOut] = Field(default_factory=list)
    created_at: datetime
    

# importacion masiva
class ChipImportSchema(DateTimeUTCMixin, BaseModel):
    numero: int
    iccid: str
    operador: str
    mb: str
    activacion: Optional[datetime] = None
    instalacion: Optional[datetime] = None
    adicional: Optional[str] = None
    status: int = Field(default=0)
    model_config = {"extra": "forbid"}