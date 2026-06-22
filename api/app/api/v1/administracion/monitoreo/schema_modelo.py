from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import base64
import binascii

# ---- MODELOS DE INVENTARIO ----

class RegistroIngresoInventarioBase(BaseModel):
    # Usamos ConfigDict para permitir trabajar con ORMs más fácilmente
    model_config = ConfigDict(from_attributes=True)

    ruc: str = Field(..., min_length=11, max_length=11)
    name_provedor: str  # Coincide con SQLAlchemy
    direccion: Optional[str] = None
    fecha: datetime
    name_prod: str
    cantidad: int
    precio: float
    image_byte: bytes

class RegistroIngresoInventarioCreate(RegistroIngresoInventarioBase):
    pass

class ProductoEntry(BaseModel):
    name: str
    cantidad: int
    precio: float
    image: str 

class RegistrarProveedorRequest(BaseModel):
    ruc: str = Field(..., min_length=11, max_length=11)
    name: str # Nombre del proveedor que viene del request
    direccion: Optional[str] = None
    fecha: datetime
    productos: List[ProductoEntry]

# ---- UTILIDADES ----

def decode_base64_image(data: Optional[str]) -> bytes:
    """Decodifica base64 manejando errores y prefijos data:image."""
    if not data or not isinstance(data, str):
        return b""
    try:
        # Elimina el prefijo 'data:image/...;base64,' si existe
        if "," in data:
            data = data.split(",")[1]
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        return b""

def transform_request_to_db_models(request_data: RegistrarProveedorRequest) -> List[RegistroIngresoInventarioCreate]:
    """
    Convierte el request anidado en una lista de modelos planos 
    compatibles con la tabla 'almacen.inventario'.
    """
    return [
        RegistroIngresoInventarioCreate(
            ruc=request_data.ruc,
            name_provedor=request_data.name, # Mapeo de 'name' a 'name_provedor'
            direccion=request_data.direccion,
            fecha=request_data.fecha,
            name_prod=p.name,
            cantidad=p.cantidad,
            precio=p.precio,
            image_byte=decode_base64_image(p.image)
        )
        for p in request_data.productos
    ]