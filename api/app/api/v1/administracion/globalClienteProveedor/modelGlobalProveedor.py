from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, CHAR, Text, Boolean, BigInteger, text
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_class import Base


class GlobalProveedor(Base):
    __tablename__ = "global_proveedores"
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

    compra: Mapped[List["Compra"]] = relationship(back_populates="proveedor")
