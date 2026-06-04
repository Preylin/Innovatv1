from decimal import ROUND_HALF_UP, Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date, datetime
from typing import Any, Optional, List

 # cuentas por pagar mensuales
class ObligacionBase(BaseModel):
    empresa: str
    detalle: Optional[str]
    monto_esperado: float
    moneda: str
    dia_pago: int
    categoria: Optional[str]

class ObligacionCreate(ObligacionBase):
    pass

class RegistroPagoCreate(BaseModel):
    obligacion_id: int
    monto_pagado: float = Field(..., gt=0)
    mes_correspondiente: date
    comprobante: Optional[str] = Field(None, max_length=50)
    estado_pago: Optional[str] = Field(default="TOTAL", max_length=20)
    metodo_pago: Optional[str] = Field(default="TRANSFERENCIA", max_length=30)
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


class ObligacionRead(ObligacionBase):
    id: int
    estado_pago: str = "PENDIENTE"
    monto_pagado_actual: Optional[float] = 0.0
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class ObligacionUpdate(ObligacionBase):
    id: int

    class Config:
        from_attributes = True

class ObligacionDelete(BaseModel):
    ids: List[int]


# cuentas por pagar a proveedores

class ResponseCuentasPorPagarProveedoresLista(BaseModel):
    id: int
    fecha_emision: date
    fecha_vencimiento: date
    serie: str
    numero: str
    nro_documento: Optional[str] = None
    razon_social: Optional[str] = None
    total: Decimal
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    moneda: str
    tipo_cambio: Decimal
    status_cobro: str = "PENDIENTE"
    link_pdf: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def calcular_status_cobro(cls, data: Any) -> Any:
        if hasattr(data, '_mapping'):
            data = dict(data._mapping)
        elif not isinstance(data, dict):
            data = dict(data)

        total = Decimal(str(data.get('total', 0.00)))
        tipo_cambio = Decimal(str(data.get('tipo_cambio', 1.000)))
        monto_pagado = Decimal(str(data.get('monto_pagado', 0.00)))
        moneda = data.get('moneda', 'PEN')

        if moneda == 'USD' and tipo_cambio > 0:
            total_esperado = total / tipo_cambio
        else:
            total_esperado = total

        total_esperado = total_esperado.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        monto_pagado = monto_pagado.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        if monto_pagado >= total_esperado:
            data['status_cobro'] = "CANCELADO"
        else:
            data['status_cobro'] = "PENDIENTE"

        return data

class CuentasPorPagarProveedoresDetalleOnetoOneReadVentas(BaseModel):
    id: int
    periodo: str
    fecha_emision: date
    fecha_vencimiento: date
    serie: str
    numero: str
    base_imponible: Decimal = Field(default=Decimal("0.00"))
    igv: Decimal = Field(default=Decimal("0.00"))
    no_gravadas: Decimal = Field(default=Decimal("0.00"))
    otros: Decimal = Field(default=Decimal("0.00"))
    total: Decimal = Field(default=Decimal("0.00"))
    tipo_cambio: Decimal = Field(default=Decimal("1.000"))
    moneda: str
    descripcion_comprobante: Optional[str] = None

    class Config:
        from_attributes = True


class CuentasPorPagarProveedoresDetalleOnetoOneReadCajaVentas(BaseModel):
    id: int
    fecha_pago: Optional[date] = None
    lugar_ingreso: Optional[str] = None
    monto_pagado: Optional[Decimal] = None
    medio_pago: Optional[str] = None
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True

class RegistrarCobroProveedores(BaseModel):
    compra_id: int
    fecha_pago: date
    lugar_salida: Optional[str] = None
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    medio_pago: str
    status_cobro: str
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True

# cuentas por pagar enventuales

class CuentasPorPagarEventualesBase(BaseModel):
    fecha_emision: date
    fecha_vencimiento: date
    empresa: str
    detalle: str
    monto_esperado: float
    moneda: str

class CuentasPorPagarEventualesCreate(CuentasPorPagarEventualesBase):
    activo: bool = True
    
    class Config:
        from_attributes = True

class CuentasPorPagarEventualesRead(CuentasPorPagarEventualesBase):
    id: int
    status_cobro: str = "PENDIENTE"
    monto_pagado: Decimal = Field(default=Decimal("0.00"))

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def calcular_status_cobro(cls, data: Any) -> Any:
        if hasattr(data, '_mapping'):
            data = dict(data._mapping)
        elif not isinstance(data, dict):
            data = dict(data)
        monto_esperado: Decimal = Decimal(str(data.get('monto_esperado', 0.00)))
        monto_pagado: Decimal = Decimal(str(data.get('monto_pagado', 0.00)))


        total_esperado = monto_esperado.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        monto_pagado = monto_pagado.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        if monto_pagado >= total_esperado:
            data['status_cobro'] = "CANCELADO"
        else:
            data['status_cobro'] = "PENDIENTE"

        return data

class CuentasPorPagarEventualesUpdate(CuentasPorPagarEventualesBase):
    id: int

    class Config:
        from_attributes = True

class CuentasPorPagarEventualesDetalleOnetoOneReadCajaVentas(BaseModel):
    id: int
    fecha_operacion: Optional[date] = None
    lugar_salida: Optional[str] = None
    monto_pagado: Optional[Decimal] = None
    medio_pago: Optional[str] = None
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True

class RegistrarPagoEventuales(BaseModel):
    obligacion_id: int
    fecha_operacion: date
    lugar_salida: str
    monto_pagado: Decimal = Field(default=Decimal("0.00"))
    medio_pago: str
    status_cobro: str
    glosa_pago: Optional[str] = None

    class Config:
        from_attributes = True
