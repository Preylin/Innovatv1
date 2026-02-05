from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, text
from datetime import datetime
from app.core.base_class import Base

class ServicioMC(Base):
    __tablename__ = "serviciomc"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    empresa: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    ubicacion: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    inicio: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fin: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    servicio: Mapped[str] = mapped_column(VARCHAR(60), nullable=False)
    informe: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    certificado: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    encargado: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    tecnico: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    incidencia: Mapped[str] = mapped_column(VARCHAR(400), nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

