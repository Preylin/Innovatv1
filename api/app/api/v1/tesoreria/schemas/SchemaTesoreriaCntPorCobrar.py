from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class CuentasPorCobrarMensualRead(BaseModel):
    id: int
    periodo: str
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    nro_documento: str
    razon_social: str
    total: Decimal = Field(default=Decimal("0.00"))
    moneda: str
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    fecha_pago: date
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    status_cobro: str
    link_pdf: str

    class Config:
        from_attributes = True