from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import TIMESTAMP, String, Numeric, ForeignKey, CHAR, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base

# 3. Ventas (Registro Principal)
class Compra(Base):
    __tablename__ = "compras"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    periodo: Mapped[str] = mapped_column(CHAR(6), nullable=False) # NOT NULL
    fecha_emision: Mapped[date] = mapped_column(nullable=False) # NOT NULL
    fecha_vencimiento: Mapped[date] = mapped_column(nullable=False) # NOT NULL
    
    tipo_cp_codigo: Mapped[str] = mapped_column(CHAR(2), nullable=False) # NOT NULL
    serie: Mapped[str] = mapped_column(CHAR(4), nullable=False) # NOT NULL
    numero: Mapped[str] = mapped_column(String(20), nullable=False) # NOT NULL
    
    # En tu SQL es nullable (no tiene NOT NULL), corregido:
    proveedor_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("administracion.global_proveedores.id"), 
        nullable=False, 
        index=True
    )
    
    moneda: Mapped[str] = mapped_column(CHAR(3), server_default="PEN", default="PEN")
    tipo_cambio: Mapped[float] = mapped_column(Numeric(12, 3), server_default="1.000", default=1.000)
    
    base_imponible: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    igv: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    no_gravadas: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    otros: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)

    nro_guia_remision: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    descripcion_comprobante: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[str] = mapped_column(CHAR(1), server_default=text("'1'"), default="1")
    link_pdf: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    proveedor: Mapped[Optional["GlobalProveedor"]] = relationship(back_populates="compra")
    movimientos_caja: Mapped[List["CajaMovimientoCompra"]] = relationship(back_populates="compra")
    asientos: Mapped[List["LibroDiarioCompra"]] = relationship(back_populates="compra")

# 4. Tesorería (Flujo de Caja)
class CajaMovimientoCompra(Base):
    __tablename__ = "caja_movimientos_compras"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    compra_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.compras.id"), nullable=True)
    fecha_pago: Mapped[date] = mapped_column(nullable=False)
    lugar_salida: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    monto_pagado: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    medio_pago: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status_cobro: Mapped[str] = mapped_column(String(20), server_default="PENDIENTE", default="PENDIENTE")
    glosa_pago: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)


    compra: Mapped[Optional["Compra"]] = relationship(back_populates="movimientos_caja")
    asientos: Mapped[List["LibroDiarioCompra"]] = relationship(back_populates="caja")

# 5. Contabilidad (Libro Diario)
class LibroDiarioCompra(Base):
    __tablename__ = "libro_diario_compras"
    __table_args__ = {"schema": "contabilidad"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    compra_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.compras.id"), nullable=True)
    caja_id: Mapped[Optional[int]] = mapped_column(ForeignKey("contabilidad.caja_movimientos_compras.id"), nullable=True)
    fecha_contable: Mapped[date] = mapped_column(nullable=False)
    periodo_contable: Mapped[str] = mapped_column(CHAR(6), nullable=False)
    cuenta_codigo: Mapped[Optional[str]] = mapped_column(ForeignKey("contabilidad.plan_contable.cuenta_codigo"), nullable=True)
    
    debe: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    haber: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default="0.00", default=0.00)
    
    glosa_asiento: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correlativo_asiento: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    compra: Mapped[Optional["Compra"]] = relationship(back_populates="asientos")
    caja: Mapped[Optional["CajaMovimientoCompra"]] = relationship(back_populates="asientos")
    plan_contable: Mapped[Optional["PlanContable"]] = relationship(back_populates="asientoscompras")