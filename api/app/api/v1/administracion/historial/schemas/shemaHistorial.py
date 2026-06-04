from pydantic import BaseModel, BeforeValidator, Field, ConfigDict, field_validator
from datetime import date, datetime
from typing import Annotated, List, Optional, Any
from decimal import Decimal
from app.helpers.limpiarStrings import limpiar_texto

class ListaHistorialVentas(BaseModel):
    id: int
    fecha_emision: date
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
    descripcion_comprobante: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ListaHistorialCompras(BaseModel):
    id: int
    fecha_emision: date
    descripcion_comprobante: Optional[str] = None
    tipo_cp_codigo: str
    serie: str
    numero: str
    nro_documento: Optional[str] = None
    razon_social: Optional[str] = None
    base_imponible: Decimal
    igv: Decimal
    no_gravadas: Decimal
    otros: Decimal
    total: Decimal
    moneda: str
    tipo_cambio: Decimal

    model_config = ConfigDict(from_attributes=True)