from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, CHAR, Text, Boolean, BigInteger, text
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base


class GlobalCliente(Base):
    __tablename__ = "global_clientes"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo_documento: Mapped[str] = mapped_column(CHAR(1), nullable=False)
    nro_documento: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    razon_social: Mapped[str] = mapped_column(String(255), nullable=False)
    direccion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contactos: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status_sunat: Mapped[str] = mapped_column(CHAR(1), nullable=False, server_default=text("'0'"), default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"), default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP"))

    ventas: Mapped[List["Venta"]] = relationship(back_populates="cliente")
    servicio_weather: Mapped[List["ServicioWeather"]] = relationship(back_populates="cliente")
    servicio_chips: Mapped[List["ServicioChips"]] = relationship(back_populates="cliente")
    servicio_mc: Mapped[List["ServicioMC"]] = relationship(back_populates="cliente")
    servicio_pro: Mapped[List["ServicioPro"]] = relationship(back_populates="cliente")
