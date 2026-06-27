
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import TIMESTAMP, String, Numeric, ForeignKey, CHAR, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base

class ServicioWeather(Base):
    __tablename__ = "tabla_weather_monitoreo"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cliente_id: Mapped[Optional[int]] = mapped_column(ForeignKey("administracion.global_clientes.id"), nullable=True, index=True)
    ubicacion_id: Mapped[Optional[int]] = mapped_column(ForeignKey("administracion.tabla_ubicaciones_monitoreo.id"), nullable=True, index=True)
    fecha_inicio: Mapped[date] = mapped_column(nullable=False)
    fecha_fin: Mapped[date] = mapped_column(nullable=False)
    fact_relacionada: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    estado: Mapped[Optional[str]] = mapped_column(String(11), server_default=text("'PENDIENTE'"), default="PENDIENTE")
    adicional: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    cliente: Mapped[Optional["GlobalCliente"]] = relationship(back_populates="servicio_weather")
    ubicacion: Mapped[Optional["TablaUbicacionesMonitoreo"]] = relationship(back_populates="servicio_weather")
