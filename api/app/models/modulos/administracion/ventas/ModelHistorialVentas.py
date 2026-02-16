from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, Numeric, Text, text
from datetime import datetime
from app.core.base_class import Base

class HistorialVentas(Base):
    __tablename__ = "historial_ventas"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str] = mapped_column(VARCHAR(300), nullable=False)
    ruc: Mapped[str] = mapped_column(VARCHAR(11), nullable=False)
    cliente: Mapped[str] = mapped_column(VARCHAR(300), nullable=False)
    tipo: Mapped[str] = mapped_column(VARCHAR(2), nullable=False)
    serie: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    numero: Mapped[int] = mapped_column(BigInteger, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    igv: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    total: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    tc: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)