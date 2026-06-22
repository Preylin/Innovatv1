import base64
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, ForeignKey, text, UniqueConstraint
from sqlalchemy.types import LargeBinary
from datetime import datetime
from app.core.base_class import Base

class Cliente(Base):
    __tablename__ = "cliente"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ruc: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    ubicacion: Mapped[list["Ubicacion"]] = relationship(back_populates="cliente", cascade="all, delete-orphan", lazy="selectin")


class Ubicacion(Base):
    __tablename__ = "ubicacion"
    __table_args__ = (
        UniqueConstraint("cliente_id", "name", name="uq_ubicacion_cliente_name"),
        {"schema": "administracion"},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    cliente_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("administracion.cliente.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    cliente: Mapped["Cliente"] = relationship(back_populates="ubicacion", lazy="joined")


class Chip(Base):
    __tablename__ = "chip"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    numero: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    iccid: Mapped[str] = mapped_column(VARCHAR(255), unique=True, nullable=False)
    operador: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    mb: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    activacion: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    instalacion: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    adicional: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=False)
    imagen1: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen2: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    def _convert_to_base64(self, image_data: bytes | None) -> str | None:
        if not image_data: return None
        try:
            return base64.b64encode(image_data).decode("utf-8")
        except Exception: return None

    @property
    def imagenes_base64(self) -> dict[str, str | None]:
        """Genera dinámicamente el diccionario de imágenes decodificadas."""
        return {
            f"imagen{i}": self._convert_to_base64(getattr(self, f"imagen{i}"))
            for i in range(1, 2)
        }
