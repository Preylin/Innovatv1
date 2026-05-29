from pydantic import BaseModel, BeforeValidator, Field, ConfigDict, field_validator
from datetime import date, datetime
from typing import Annotated, List, Optional, Any
from decimal import Decimal
from app.helpers.limpiarStrings import limpiar_texto

TextoLimpio = Annotated[Optional[str], BeforeValidator(limpiar_texto)]

# --- Esquema de Ventas ---
class CompraBase(BaseModel):
    periodo: str
    fecha_emision: date
    fecha_vencimiento: date
    tipo_cp_codigo: str = Field(..., min_length=1, max_length=2)
    serie: str = Field(..., max_length=4)
    numero: str = Field(..., max_length=20)
    moneda: str = "PEN"
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    base_imponible: Decimal = Field(default=Decimal("0.00"))
    igv: Decimal = Field(default=Decimal("0.00"))
    no_gravadas: Decimal = Field(default=Decimal("0.00"))
    otros: Decimal = Field(default=Decimal("0.00"))
    total: Decimal = Field(default=Decimal("0.00"))
    nro_guia_remision: Optional[str] = None
    descripcion_comprobante: TextoLimpio
    is_active: str = '1'

class CompraCreate(CompraBase):
    id: Optional[int] = None
    nro_documento: TextoLimpio
    razon_social: TextoLimpio
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



class SyncComrpasPayload(BaseModel):
    created: List[CompraCreate]
    updates: List[CompraCreate]

    model_config = ConfigDict(from_attributes=True)


class ResponseCompraLista(BaseModel):
    id: int
    periodo: str
    fecha_emision: date
    fecha_vencimiento: date
    tipo_cp_codigo: str
    serie: str
    numero: str
    tipo_documento: Optional[str] = None
    nro_documento: Optional[str] = None
    razon_social: Optional[str] = None
    base_imponible: Decimal
    igv: Decimal
    no_gravadas: Decimal
    otros: Decimal
    total: Decimal
    moneda: str
    tipo_cambio: Decimal
    descripcion_comprobante: Optional[str] = None
    is_active: str = '1'
    link_pdf: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DeleteComprasPayload(BaseModel):
    ids: List[int]