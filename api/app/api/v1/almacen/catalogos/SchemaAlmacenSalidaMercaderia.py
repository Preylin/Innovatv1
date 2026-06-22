from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Union
from datetime import datetime
import base64

class ImageItem(BaseModel):
    image_byte: str

# ----- MODELO DE MERCADERIA Salida MERCADERIA EL FRONTEND ----

class ProductoEntryMercaderia(BaseModel):
    codigo: str
    uuid_mercaderia: str
    moneda: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: str
    categoria: str
    serie: str
    cantidad: int
    valor: float
    image: List[ImageItem]

class RegistrarClienteRequestMercaderia(BaseModel):
    ruc: str
    cliente: str
    adicional: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    fecha: datetime
    productos: List[ProductoEntryMercaderia]

# ---- MODELO BASE Salida ----

class RegistroSalidaInventarioBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    ruc: str
    cliente: str
    adicional: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    uuid_mercaderia: str
    fecha: datetime
    moneda: str
    codigo: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: str
    serie: str
    cantidad: int
    valor: float
    image_byte: Optional[Union[bytes, str]] = None

# ---- MODELO Salida MERCADERIA ----

class RegistroSalidaMercaderiaCreate(RegistroSalidaInventarioBase):
    categoria: str


class RegistroSalidaMercaderiaOut(RegistroSalidaInventarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    categoria: str
    created_at: datetime

    @field_validator("image_byte", mode="before")
    @classmethod
    def bytes_to_base64(cls, v):
        if isinstance(v, bytes):
            # Convertimos los bytes de la DB a string base64 para el JSON
            return base64.b64encode(v).decode("utf-8")
        return v
