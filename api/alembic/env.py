# alembic/env.py
from __future__ import annotations

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy import engine_from_config
from sqlalchemy import create_engine
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context

# Importa tus settings y metadata de modelos
from app.core.config import settings
from app.db.base import Base  # Ajusta al path real donde defines Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# Metadata target for 'autogenerate'
target_metadata = getattr(Base, "metadata", None)

def get_url() -> str:
    """
    Devuelve la DATABASE_URL desde tus settings.
    Asegúrate que settings.DATABASE_URL use el dialecto async, p.ej.:
    'postgresql+asyncpg://user:pass@host:port/dbname'
    """
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Function executed by run_sync to run migrations synchronously on a connection."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using an async engine."""
    url = get_url()
    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # run_sync ejecuta la función síncrona en la conexión async
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # Ejecuta la función async con asyncio.run()
    asyncio.run(run_migrations_online())
