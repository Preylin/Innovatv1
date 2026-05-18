from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import TIMESTAMP, String, Integer, Numeric, ForeignKey, CHAR, Text, DateTime, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from app.core.base_class import Base

# 1. Plan Contable General Empresarial
class PlanContable(Base):
    __tablename__ = "plan_contable"
    __table_args__ = {"schema": "contabilidad"}

    cuenta_codigo: Mapped[str] = mapped_column(String(10), primary_key=True)
    descripcion: Mapped[str] = mapped_column(String(150), nullable=False) # NOT NULL
    nivel: Mapped[int] = mapped_column(Integer, server_default="2", default=2) # DEFAULT 2
    tipo_cuenta: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # NULL
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    asientos: Mapped[List["LibroDiarioVentas"]] = relationship(back_populates="plan_contable")


# 3. Ventas (Registro Principal)
class Venta(Base):
    __tablename__ = "ventas"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    periodo: Mapped[str] = mapped_column(CHAR(6), nullable=False) # NOT NULL
    fecha_emision: Mapped[date] = mapped_column(nullable=False) # NOT NULL
    fecha_vencimiento: Mapped[Optional[date]] = mapped_column(nullable=True) # NULL
    
    tipo_cp_codigo: Mapped[str] = mapped_column(CHAR(2), nullable=False) # NOT NULL
    serie: Mapped[str] = mapped_column(CHAR(4), nullable=False) # NOT NULL
    numero: Mapped[str] = mapped_column(String(10), nullable=False) # NOT NULL
    
    # En tu SQL es nullable (no tiene NOT NULL), corregido:
    cliente_id: Mapped[Optional[int]] = mapped_column(ForeignKey("administracion.global_clientes.id"), nullable=False, index=True)
    
    moneda: Mapped[str] = mapped_column(CHAR(3), server_default="PEN", default="PEN")
    tipo_cambio: Mapped[float] = mapped_column(Numeric(12, 3), server_default="1.000", default=1.000)
    
    base_imponible: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    igv: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    
    monto_retencion: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0.00", default=0.00)
    monto_detraccion: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0.00", default=0.00)
    
    nro_orden_compra: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    nro_guia_remision: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    descripcion_comprobante: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    categoria: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    link_pdf: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    cliente: Mapped[Optional["GlobalCliente"]] = relationship(back_populates="ventas")
    movimientos_caja: Mapped[List["CajaMovimientoVenta"]] = relationship(back_populates="venta")
    asientos: Mapped[List["LibroDiarioVentas"]] = relationship(back_populates="venta")

# 4. Tesorería (Flujo de Caja)
class CajaMovimientoVenta(Base):
    __tablename__ = "caja_movimientos_ventas"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    venta_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.ventas.id"), nullable=True)
    fecha_pago: Mapped[date] = mapped_column(nullable=False)
    lugar_ingreso: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    monto_pagado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    medio_pago: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status_cobro: Mapped[str] = mapped_column(String(20), server_default="PENDIENTE", default="PENDIENTE")
    glosa_pago: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    venta: Mapped[Optional["Venta"]] = relationship(back_populates="movimientos_caja")
    asientos: Mapped[List["LibroDiarioVentas"]] = relationship(back_populates="caja")

# 5. Contabilidad (Libro Diario)
class LibroDiarioVentas(Base):
    __tablename__ = "libro_diario_ventas"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    venta_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.ventas.id"), nullable=True)
    caja_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.caja_movimientos_ventas.id"), nullable=True)
    fecha_contable: Mapped[date] = mapped_column(nullable=False)
    periodo_contable: Mapped[str] = mapped_column(CHAR(6), nullable=False)
    cuenta_codigo: Mapped[Optional[str]] = mapped_column(ForeignKey("contabilidad.plan_contable.cuenta_codigo"), nullable=True)
    
    debe: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    haber: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    
    glosa_asiento: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correlativo_asiento: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    venta: Mapped[Optional["Venta"]] = relationship(back_populates="asientos")
    caja: Mapped[Optional["CajaMovimientoVenta"]] = relationship(back_populates="asientos")
    plan_contable: Mapped[Optional["PlanContable"]] = relationship(back_populates="asientos")