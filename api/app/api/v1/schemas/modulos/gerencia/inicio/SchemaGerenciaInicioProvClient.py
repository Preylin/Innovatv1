from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


# ---- MODELO DATOS CLIENTE ----
class ClienteBase(BaseModel):
    ruc: str
    cliente: str
    dfiscal: Optional[str] = None
    contacto1: Optional[str] = None
    contacto2: Optional[str] = None
    contacto3: Optional[str] = None
    contacto4: Optional[str] = None
    contacto5: Optional[str] = None
    otro1: Optional[str] = None
    otro2: Optional[str] = None
    otro3: Optional[str] = None
    otro4: Optional[str] = None
    otro5: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    ruc: Optional[str] = None
    cliente: Optional[str] = None
    dfiscal: Optional[str] = None
    contacto1: Optional[str] = None
    contacto2: Optional[str] = None
    contacto3: Optional[str] = None
    contacto4: Optional[str] = None
    contacto5: Optional[str] = None
    otro1: Optional[str] = None
    otro2: Optional[str] = None
    otro3: Optional[str] = None
    otro4: Optional[str] = None
    otro5: Optional[str] = None

class ClienteOut(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---- MODELO DATOS PROVEEDORES ----
class ProveedorBase(BaseModel):
    ruc: str
    proveedor: str
    dfiscal: Optional[str] = None
    contacto1: Optional[str] = None
    contacto2: Optional[str] = None
    contacto3: Optional[str] = None
    contacto4: Optional[str] = None
    contacto5: Optional[str] = None
    otro1: Optional[str] = None
    otro2: Optional[str] = None
    otro3: Optional[str] = None
    otro4: Optional[str] = None
    otro5: Optional[str] = None

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    ruc: Optional[str] = None
    proveedor: Optional[str] = None
    dfiscal: Optional[str] = None
    contacto1: Optional[str] = None
    contacto2: Optional[str] = None
    contacto3: Optional[str] = None
    contacto4: Optional[str] = None
    contacto5: Optional[str] = None
    otro1: Optional[str] = None
    otro2: Optional[str] = None
    otro3: Optional[str] = None
    otro4: Optional[str] = None
    otro5: Optional[str] = None

class ProveedorOut(ProveedorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime



