import base64
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, Numeric, text
from sqlalchemy.types import LargeBinary
from datetime import datetime
from app.core.base_class import Base

class SalidaMaterial(Base):
    __tablename__ = "salida_material"
    __table_args__ = {"schema": "almacen"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ruc: Mapped[str] = mapped_column(VARCHAR(11), nullable=False)
    cliente: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    serieNumGR: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    condicion: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    fecha: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    adicional: Mapped[str] = mapped_column(VARCHAR(200), nullable=True)
    codigo: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    uuid_material: Mapped[str] = mapped_column(VARCHAR(40), nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    marca: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    modelo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    medida: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    dimension: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    moneda: Mapped[str] = mapped_column(VARCHAR(10), nullable=False)
    serie: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    cantidad: Mapped[int] = mapped_column(BigInteger, nullable=False)
    valor: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    image_byte: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    tipo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    

    @property
    def image_base64(self) -> str | None:
        if not self.image_byte:
            return None
        try:
            return base64.b64encode(self.image_byte).decode("utf-8")
        except Exception:
            return None