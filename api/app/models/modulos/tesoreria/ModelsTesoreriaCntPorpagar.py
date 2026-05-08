from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, Date, Numeric, text, Text, ForeignKey # Agregamos Text y ForeignKey
from datetime import datetime
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