import base64
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON, TIMESTAMP, VARCHAR, BigInteger, ForeignKey, text, UniqueConstraint
from sqlalchemy.dialects import postgresql
from sqlalchemy.types import LargeBinary
from datetime import datetime
from app.core.base_class import Base

"""
Módulo que define los modelos de base de datos para la autenticación y autorización.

Este módulo contiene las definiciones de los modelos ORM de SQLAlchemy para
Usuario (usuarios de la aplicación), Permiso (permisos asignados a los usuarios)
e IdempotencyKey (para garantizar la idempotencia de ciertas operaciones de API).
"""


# Definición del tipo ENUM para el estado del usuario
estado_usuario_pg = postgresql.ENUM(
    "activo", "bloqueado",
    name="estado_usuario",
    schema= "acceso",
    create_type=False
)

class Usuario(Base):
    """
    Modelo de SQLAlchemy que representa un usuario en la base de datos.

    Corresponde a la tabla 'usuario' en el esquema 'acceso'.
    """
    __tablename__ = "usuario"
    __table_args__ = {"schema":"acceso"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(postgresql.CITEXT, unique=True)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    cargo: Mapped[str|None] = mapped_column(nullable=False)
    estado: Mapped[str] = mapped_column(estado_usuario_pg, server_default=text("'bloqueado'::acceso.estado_usuario"), nullable=False)
    imagen:Mapped[bytes | None] = mapped_column(LargeBinary)
    created_at: Mapped[datetime] = mapped_column(server_default=text("NOW()"), nullable=False)

    permisos: Mapped[list["Permiso"]] = relationship(back_populates="usuario", cascade="all, delete-orphan", lazy="selectin")

    @property
    def image_base64(self) -> str | None:
        """
        Retorna la imagen del usuario codificada en formato base64.

        Esta propiedad es útil para serializar la imagen en respuestas de API
        sin necesidad de almacenarla directamente en la base de datos como base64.
        """
        if not self.imagen:
            return None
        try:
            return base64.b64encode(self.imagen).decode("utf-8")
        except Exception:
            return None

class Permiso(Base):
    """
    Modelo de SQLAlchemy que representa un permiso asignado a un usuario.

    Corresponde a la tabla 'permiso' en el esquema 'acceso'.
    """
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
    created_at: Mapped[datetime] = mapped_column(server_default=text("NOW()"), nullable=False)

    usuario: Mapped["Usuario"] = relationship(back_populates="permisos", lazy="joined")
