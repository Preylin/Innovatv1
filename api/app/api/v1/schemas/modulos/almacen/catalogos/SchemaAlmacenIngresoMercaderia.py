from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Optional, List, Union
from datetime import datetime
import base64

class ImageItem(BaseModel):
    image_byte: str

# ----- MODELO DE MERCADERIA INGRESO MERCADERIA EL FRONTEND ----

class ProductoEntryMercaderia(BaseModel):
    uuid_mercaderia: str
    codigo: str
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
    ubicacion: str

class RegistrarProveedorRequestMercaderia(BaseModel):
    ruc: str
    proveedor: str
    serieNumCP: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    fecha: datetime
    moneda: str
    productos: List[ProductoEntryMercaderia]

# ---- MODELO BASE INGRESO ----

class RegistroIngresoInventarioBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    ruc: str
    proveedor: str
    serieNumCP: Optional[str] = None
    serieNumGR: Optional[str] = None
    condicion: str
    fecha: datetime
    moneda: str
    uuid_mercaderia: str
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
    ubicacion: str

# ---- MODELO INGRESO MERCADERIA ----

class RegistroIngresoMercaderiaCreate(RegistroIngresoInventarioBase):
    categoria: str


class RegistroIngresoMercaderiaOut(RegistroIngresoInventarioBase):
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

# ----- MODELO DE SALIDA DE DATOS DE TABLA VIEW STOCK DETALLADO ----
class StockActualDetallado(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    codigo: str
    uuid_registro: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: str
    categoria: str
    ubicacion: str
    plimit: int
    serie: str
    cantidad_inicial: int
    cantidad_salida: int
    stock_actual: int
    valor: float
    moneda: str
    fecha_ingreso: datetime
    image_byte: Optional[Union[bytes, str]] = None

    @field_validator("image_byte", mode="before")
    @classmethod
    def bytes_to_base64(cls, v):
        if isinstance(v, bytes):
            # Convertimos los bytes de la DB a string base64 para el JSON
            return base64.b64encode(v).decode("utf-8")
        return v
    

# ---- MODELO DE SALIDA DE LIMITE DE STOCK COMO FILTRO DE PRODUCTOS AGOTADOS ----

class StockActualLimitMercaderia(BaseModel):
    codigo: str
    name: str
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    imagen3: Optional[str] = None
    imagen4: Optional[str] = None
    stock_actual: int
    plimit: int
    @field_validator("imagen1", "imagen2", "imagen3", "imagen4", mode="before")
    @classmethod
    def bytes_to_base64(cls, v):
        """Convierte automáticamente cualquier campo de imagen de bytes a base64."""
        if isinstance(v, bytes):
            return base64.b64encode(v).decode("utf-8")
        return v