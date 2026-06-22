from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, text
from datetime import datetime
from app.core.base_class import Base

class ClienteInicio(Base):
    __tablename__ = "clientesinicio"
    __table_args__ = {"schema": "gerencia"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ruc: Mapped[str] = mapped_column(VARCHAR(11), unique=True, nullable=False)
    cliente: Mapped[str] = mapped_column(VARCHAR(400), nullable=False)
    dfiscal: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto1: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto2: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto3: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto4: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto5: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro1: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro2: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro3: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro4: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro5: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)


class ProveedorInicio(Base):
    __tablename__ = "proveedoresinicio"
    __table_args__ = {"schema": "gerencia"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ruc: Mapped[str] = mapped_column(VARCHAR(11), unique=True, nullable=False)
    proveedor: Mapped[str] = mapped_column(VARCHAR(400), nullable=False)
    dfiscal: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto1: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto2: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto3: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto4: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    contacto5: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro1: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro2: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro3: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro4: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    otro5: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
