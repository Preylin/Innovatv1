from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import TIMESTAMP, VARCHAR, BigInteger, Numeric, text
from datetime import datetime
from app.core.base_class import Base

class CajaChica(Base):
    __tablename__ = "cajachica"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    descripcion: Mapped[str] = mapped_column(VARCHAR(700), nullable=False)
    referencia: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    ingreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    egreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    adicionales: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Bcpsoles(Base):
    __tablename__ = "bcpsoles"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    descripcion: Mapped[str] = mapped_column(VARCHAR(700), nullable=False)
    referencia: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    ingreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    egreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    adicionales: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Bcpdolares(Base):
    __tablename__ = "bcpdolares"
    __table_args__ = {"schema": "tesoreria"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    descripcion: Mapped[str] = mapped_column(VARCHAR(700), nullable=False)
    referencia: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    ingreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    egreso: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    adicionales: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))