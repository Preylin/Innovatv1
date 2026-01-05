from sqlalchemy.orm import Mapped, mapped_column, relationship, declarative_base
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, ForeignKey, text, UniqueConstraint
from sqlalchemy.types import LargeBinary
from datetime import datetime

Base = declarative_base()

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
