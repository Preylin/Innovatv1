from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import CHAR, TIMESTAMP, VARCHAR, BigInteger, Date, Numeric, String, text, Text, ForeignKey # Agregamos Text y ForeignKey
from datetime import date, datetime
from app.core.base_class import Base

class ObligacionCuentasPorPagar(Base):
    __tablename__ = "obligaciones_fijas"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    empresa: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    detalle: Mapped[str] = mapped_column(VARCHAR(600), nullable=True)
    monto_esperado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    moneda: Mapped[str] = mapped_column(VARCHAR(3), nullable=False)
    dia_pago: Mapped[int] = mapped_column(BigInteger, nullable=False)
    categoria: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    activo: Mapped[bool] = mapped_column(default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

    # Relación
    pagos = relationship("RegistroCuentasPorPagar", back_populates="obligacion")


class RegistroCuentasPorPagar(Base):
    __tablename__ = "registros_pagos"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    obligacion_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tesoreria.obligaciones_fijas.id"), nullable=False)
    fecha_operacion: Mapped[datetime] = mapped_column(Date, server_default=text('CURRENT_DATE'))
    mes_correspondiente: Mapped[datetime] = mapped_column(Date, nullable=False)
    monto_pagado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    comprobante: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    estado_pago: Mapped[str] = mapped_column(VARCHAR(20), nullable=False) 
    metodo_pago: Mapped[str] = mapped_column(VARCHAR(30), nullable=True)
    observaciones: Mapped[str] = mapped_column(Text, nullable=True)

    obligacion = relationship("ObligacionCuentasPorPagar", back_populates="pagos")

class ObligacionCuentasPorPagarEventuales(Base):
    __tablename__ = "obligaciones_eventuales"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    fecha_emision: Mapped[date] = mapped_column(nullable=False) # NOT NULL
    fecha_vencimiento: Mapped[date] = mapped_column(nullable=False) # NOT NULL
    empresa: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    detalle: Mapped[str] = mapped_column(VARCHAR(600), nullable=True)
    monto_esperado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    moneda: Mapped[str] = mapped_column(CHAR(3), server_default="PEN", default="PEN")
    activo: Mapped[bool] = mapped_column(default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    pagos: Mapped[list["CajaMovimientoEventuales"]] = relationship(back_populates="obligacion")


class CajaMovimientoEventuales(Base):
    __tablename__ = "registros_pagos_eventuales"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    obligacion_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tesoreria.obligaciones_eventuales.id"), nullable=False)
    fecha_operacion: Mapped[datetime] = mapped_column(Date, server_default=text('CURRENT_DATE'))
    lugar_salida: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    monto_pagado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    medio_pago: Mapped[str] = mapped_column(VARCHAR(20), nullable=True)
    status_cobro: Mapped[str] = mapped_column(String(20), server_default="PENDIENTE", default="PENDIENTE")
    glosa_pago: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    obligacion: Mapped[list["ObligacionCuentasPorPagarEventuales"]] = relationship(back_populates="pagos")

