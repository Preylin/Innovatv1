from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, text
from datetime import datetime
from app.core.base_class import Base


class Weather(Base):
    __tablename__ = "weather"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    ubicacion: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    inicio: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fin: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fact_rel: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    adicional: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

class Pro(Base):
    __tablename__ = "pro"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    ubicacion: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    inicio: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fin: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fact_rel: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    adicional: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

class ChipServicio(Base):
    __tablename__ = "chipservicio"
    __table_args__ = {"schema": "administracion"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    ubicacion: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    numero: Mapped[str] = mapped_column(VARCHAR(15), nullable=False)
    operador: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    plan: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    inicio: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fin: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fact_rel: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    adicional: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

