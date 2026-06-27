
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import TIMESTAMP, String, Numeric, ForeignKey, CHAR, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base

class TablaUbicacionesMonitoreo(Base):
    __tablename__ = "tabla_ubicaciones_monitoreo"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ubicacion: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    is_active: Mapped[Optional[bool]] = mapped_column(nullable=False, server_default=text("TRUE"), default=True)
    fecha_registro: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    servicio_weather: Mapped[List["ServicioWeather"]] = relationship(back_populates="ubicacion")
    servicio_pro: Mapped[List["ServicioPro"]] = relationship(back_populates="ubicacion")
    servicio_mc: Mapped[List["ServicioMC"]] = relationship(back_populates="ubicacion")
    servicio_chips: Mapped[List["ServicioChips"]] = relationship(back_populates="ubicacion")

