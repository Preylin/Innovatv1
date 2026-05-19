from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
from typing import List, Optional, Any
from decimal import Decimal

# --- Esquema de Clientes ---
class ClienteBase(BaseModel):
    tipo_documento: str = Field(..., pattern="^[16]$") 
    nro_documento: str = Field(..., min_length=8, max_length=15)
    razon_social: str
    direccion: Optional[str] = None
    contactos: Optional[dict[str, Any]] = None

class ClienteResponse(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

# --- Esquema de Ventas ---
class VentaBase(BaseModel):
    periodo: str = Field(..., pattern=r"^\d{6}$", example="202605")
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    tipo_cp_codigo: str = Field(..., min_length=1, max_length=2)
    serie: str = Field(..., max_length=4)
    numero: str = Field(..., max_length=10)
    moneda: str = "PEN"
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    base_imponible: Decimal = Field(default=Decimal("0.00"))
    igv: Decimal = Field(default=Decimal("0.00"))
    total: Decimal = Field(default=Decimal("0.00"))
    monto_retencion: Decimal = Field(default=Decimal("0.00"))
    monto_detraccion: Decimal = Field(default=Decimal("0.00"))
    nro_orden_compra: Optional[str] = None
    nro_guia_remision: Optional[str] = None
    descripcion_comprobante: Optional[str] = None
    is_active: str = '1'
    categoria: Optional[str] = None
    

class VentaCreate(VentaBase):
    id: Optional[int] = None
    nro_documento: Optional[str] = None
    razon_social: Optional[str] = None
    tipo_documento: Optional[str] = None
    link_pdf: Optional[str] = None

    @field_validator("fecha_emision", "fecha_vencimiento", mode="before")
    @classmethod
    def transformar_a_fecha_pura(cls, v: Any) -> Any:
        if isinstance(v, str):
            # Si viene como "2024-01-12T05:00:00.000Z", tomamos solo los primeros 10 caracteres
            return v.split("T")[0]
        if isinstance(v, datetime):
            # Si ya es un objeto datetime, extraemos solo la fecha
            return v.date()
        return v
    

class VentaResponse(VentaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    cliente: Optional[ClienteResponse] = None # Opcional porque la FK en SQL lo es
    created_at: datetime

class ResponseVentaLista(BaseModel):
    id: int
    periodo: str
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    tipo_cp_codigo: str
    serie: str
    numero: str
    tipo_documento: Optional[str] = None
    nro_documento: Optional[str] = None
    razon_social: Optional[str] = None
    base_imponible: Decimal
    igv: Decimal
    total: Decimal
    moneda: str
    tipo_cambio: Decimal
    categoria: Optional[str] = None
    is_active: str
    descripcion_comprobante: Optional[str] = None
    link_pdf: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DeleteVentasPayload(BaseModel):
    ids: List[int]

class SyncVentasPayload(BaseModel):
    created: List[VentaCreate]
    updates: List[VentaCreate]

    model_config = ConfigDict(from_attributes=True)