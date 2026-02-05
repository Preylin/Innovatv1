import base64
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, text
from sqlalchemy.types import LargeBinary
from datetime import datetime
from app.core.base_class import Base

class CatalogoMercaderia(Base):
    __tablename__ = "catalogo_mercaderia"
    __table_args__ = {"schema": "almacen"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(VARCHAR(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    marca: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    modelo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    medida: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    categoria: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    plimit: Mapped[int] = mapped_column(BigInteger, nullable=False)
    dimension: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    descripcion: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    
    # Imágenes en binario
    imagen1: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen2: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen3: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen4: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    # --- Optimización ---

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
            for i in range(1, 5)
        }
    

class CatalogoMaterial(Base):
    __tablename__ = "catalogo_material"
    __table_args__ = {"schema": "almacen"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(VARCHAR(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    marca: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    modelo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    medida: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    tipo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    plimit: Mapped[int] = mapped_column(BigInteger, nullable=False)
    dimension: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    descripcion: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    
    # Imágenes en binario
    imagen1: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen2: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen3: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    imagen4: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    # --- Optimización ---

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
            for i in range(1, 5)
        }