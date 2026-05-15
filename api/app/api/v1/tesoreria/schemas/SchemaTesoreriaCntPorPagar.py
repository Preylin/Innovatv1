from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List

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
