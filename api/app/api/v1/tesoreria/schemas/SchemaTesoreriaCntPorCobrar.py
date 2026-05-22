from datetime import date
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


class CuentasPorCobrarMensualRead(BaseModel):
    id: int
    fecha_emision: date
    fecha_vencimiento: date
    serie: str
    numero: str
    nro_documento: str
    razon_social: str
    total: Decimal = Field(default=Decimal("0.00"))
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    monto_retencion: Decimal = Field(default=Decimal("0.00"))
    monto_detraccion: Decimal = Field(default=Decimal("0.00"))
    fecha_pago_detraccion_retencion: Optional[date] = None
    moneda: str
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    status_cobro: str = "PENDIENTE"  # Ahora tiene un default, se calculará abajo
    link_pdf: Optional[str] = None

    class Config:
        from_attributes = True

    @model_validator(mode='before')
    @classmethod
    def calcular_status_cobro(cls, data: Any) -> Any:
        # Si la data viene de los mappings de SQLAlchemy, la tratamos como diccionario o como objeto
        if hasattr(data, '_mapping'):
            data = dict(data._mapping)
        elif not isinstance(data, dict):
            data = dict(data)

        total = Decimal(str(data.get('total', 0.00)))
        tipo_cambio = Decimal(str(data.get('tipo_cambio', 1.000)))
        monto_pagado = Decimal(str(data.get('monto_pagado', 0.00)))
        moneda = data.get('moneda', 'PEN')

        # OJO AQUÍ: Si la moneda es Dólares (USD), aplicamos la conversión que mencionas.
        # Si es Soles (PEN) u otra moneda base, asumimos que el tipo_cambio no afecta (o es 1).
        if moneda == 'USD' and tipo_cambio > 0:
            total_esperado = total / tipo_cambio
        else:
            total_esperado = total

        # Consideramos CANCELADO si lo pagado es igual o mayor a lo esperado
        # (Usamos >= por si hay variaciones mínimas de decimales a favor)
        if monto_pagado >= total_esperado:
            data['status_cobro'] = "CANCELADO"
        else:
            data['status_cobro'] = "PENDIENTE"

        return data


class CuentasPorCobrarDetalleOnetoOneReadVentas(BaseModel):
    id: int
    periodo: str
    fecha_emision: date
    fecha_vencimiento: date
    serie: str
    numero: str
    base_imponible: Decimal = Field(default=Decimal("0.00"))
    igv: Decimal = Field(default=Decimal("0.00"))
    total: Decimal = Field(default=Decimal("0.00"))
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    moneda: str
    monto_detraccion: Optional[Decimal] = None
    monto_retencion: Optional[Decimal] = None
    nro_orden_compra: Optional[str] = None
    nro_guia_remision: Optional[str] = None
    fecha_pago_detraccion_retencion: Optional[date] = None
    descripcion_comprobante: Optional[str] = None

    class Config:
        from_attributes = True


class CuentasPorCobrarDetalleOnetoOneReadCajaVentas(BaseModel):
    id: int
    fecha_pago: Optional[date] = None
    lugar_ingreso: Optional[str] = None
    monto_pagado: Optional[Decimal] = None
    medio_pago: Optional[str] = None
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True

class RegistrarCobro(BaseModel):
    venta_id: int
    fecha_pago: date
    lugar_ingreso: Optional[str] = None
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    medio_pago: str
    status_cobro: str
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True

class UpdateFechaPagoRetencionDetraccionSchema(BaseModel):
    fecha_pago_detraccion_retencion: date | None = Field(
        default=None, 
        description="Fecha de pago en formato YYYY-MM-DD o null para eliminarla"
    )
    
    class Config:
        from_attributes = True