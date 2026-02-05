from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Union
from datetime import datetime
import base64

class ImageItem(BaseModel):
    image_byte: str

# ----- MODELO DE Material Salida Material EL FRONTEND ----

class ProductoEntryMaterial(BaseModel):
    codigo: str
    uuid_material: str
    moneda: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: str
    tipo: str
    serie: str
    cantidad: int
    valor: float
    image: List[ImageItem]

class RegistrarClienteRequestMaterial(BaseModel):
    ruc: str
    cliente: str
    adicional: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    fecha: datetime
    productos: List[ProductoEntryMaterial]

# ---- MODELO BASE Salida ----

class RegistroSalidaInventarioBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    ruc: str
    cliente: str
    adicional: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    fecha: datetime
    moneda: str
    codigo: str
    uuid_material: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: str
    serie: str
    cantidad: int
    valor: float
    image_byte: Optional[Union[bytes, str]] = None

# ---- MODELO Salida Material ----

class RegistroSalidaMaterialCreate(RegistroSalidaInventarioBase):
    tipo: str


class RegistroSalidaMaterialOut(RegistroSalidaInventarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tipo: str
    created_at: datetime

    @field_validator("image_byte", mode="before")
    @classmethod
    def bytes_to_base64(cls, v):
        if isinstance(v, bytes):
            # Convertimos los bytes de la DB a string base64 para el JSON
            return base64.b64encode(v).decode("utf-8")
        return v
