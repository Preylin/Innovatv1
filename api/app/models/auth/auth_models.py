import base64
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON, TIMESTAMP, VARCHAR, BigInteger, ForeignKey, text, UniqueConstraint
from sqlalchemy.dialects import postgresql
from sqlalchemy.types import LargeBinary
from datetime import datetime
from app.core.base_class import Base

# Definición del tipo ENUM para el estado del usuario
estado_usuario_pg = postgresql.ENUM(
    "activo", "bloqueado",
    name="estado_usuario",
    schema= "acceso",
    create_type=False
)

class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = {"schema":"acceso"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(postgresql.CITEXT, unique=True)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    cargo: Mapped[str] = mapped_column(nullable=False)
    estado: Mapped[str] = mapped_column(estado_usuario_pg, server_default=text("'bloqueado'::acceso.estado_usuario"), nullable=False)
    imagen:Mapped[bytes] = mapped_column(LargeBinary)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    permisos: Mapped[list["Permiso"]] = relationship(back_populates="usuario", cascade="all, delete-orphan", lazy="selectin")

    @property
    def image_base64(self) -> str:
        if not self.imagen:
            return None
        return base64.b64encode(self.imagen).decode("utf-8")

class Permiso(Base):
    __tablename__ = "permiso"
    __table_args__ = (
        UniqueConstraint("usuario_id", "name_module", name="uq_permiso_usuario_modulo"),
        {"schema":"acceso"},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name_module: Mapped[str] = mapped_column(nullable=False)
    usuario_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("acceso.usuario.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    usuario: Mapped["Usuario"] = relationship(back_populates="permisos", lazy="joined")
