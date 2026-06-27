
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import BOOLEAN, TIMESTAMP, String, Numeric, ForeignKey, CHAR, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base

class InventarioChips(Base):
    __tablename__ = "tabla_chips_inventario_monitoreo"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero_chip: Mapped[Optional[str]] = mapped_column(String(12), nullable=False, unique=True)
    iccid: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    operador: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    plan: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    fecha_activacion: Mapped[Optional[date]] = mapped_column(nullable=True)
    fecha_instalacion: Mapped[Optional[date]] = mapped_column(nullable=True)
    adicional: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[Optional[bool]] = mapped_column(nullable=False, server_default=text("TRUE"), default=True)
    fecha_registro: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    servicio_chips: Mapped[List["ServicioChips"]] = relationship(back_populates="chip")