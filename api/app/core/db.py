# modulo de configuracion de la base de datos: engine, sessionmaker, dependencias.
# conexion asyncrona a la base de datos usando SQLAlchemy.
"""
Módulo para la configuración y gestión de la base de datos.

Este módulo establece la conexión asíncrona a la base de datos
utilizando SQLAlchemy, define el engine, el sessionmaker, y provee
funciones para inicializar, cerrar y obtener sesiones de base de datos.
También incluye un healthcheck para verificar la conexión.
"""
import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from sqlalchemy import text
from app.core.config import settings

engine: Optional[AsyncEngine] = None
"""El objeto Engine de SQLAlchemy para la conexión asíncrona a la base de datos."""
AsyncSessionLocal: Optional[async_sessionmaker[AsyncSession]] = None
"""El sessionmaker para crear sesiones de base de datos asíncronas."""
logger = logging.getLogger("app.db")

def make_engine() -> AsyncEngine:
    """
    Crea y configura el engine de SQLAlchemy para la conexión asíncrona a la base de datos.

    Configura el pool de conexiones y el timeout de las sentencias
    basándose en las configuraciones definidas en `app.core.config.settings`.

    Returns:
        Un objeto `AsyncEngine` configurado.
    """
    connect_args = {} # argumentos extra de conexion para asyncpg driver (PostgreSQL)
    if getattr(settings, "DB_STATEMENT_TIMEOUT_MS", None):
        connect_args["server_settings"] = {
            "statement_timeout": str(settings.DB_STATEMENT_TIMEOUT_MS) # fuerza que el servidor aborte consultas que excedan el tiempo determinado
        }
    return create_async_engine(
        settings.DATABASE_URL,
        echo=bool(getattr(settings, "DEBUG", False)),  # False en producción
        pool_pre_ping=True, # evita conexiones muertas
        pool_size=getattr(settings, "DB_POOL_SIZE", 5), # tamaño del pool
        max_overflow=getattr(settings, "DB_MAX_OVERFLOW", 10), # conexiones extra
        pool_recycle=getattr(settings, "DB_POOL_RECYCLE", 1800), # reciclar conexiones
        connect_args=connect_args or None,
    )

def init_db() -> None:
    """
    Inicializa el engine de la base de datos y el sessionmaker.

    Esta función debe ser llamada al inicio de la aplicación para
    establecer la conexión a la base de datos.
    """
    global engine, AsyncSessionLocal
    if engine is None:
        engine = make_engine()
    if AsyncSessionLocal is None:
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,
        )

async def dispose_db() -> None:
    """
    Cierra y libera los recursos del engine de la base de datos.

    Esta función debe ser llamada al apagar la aplicación para
    asegurar un cierre limpio de las conexiones.
    """
    global engine, AsyncSessionLocal
    if engine is not None:
        await engine.dispose()
        engine = None
        AsyncSessionLocal = None

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependencia de FastAPI para obtener una sesión de base de datos asíncrona.

    Provee una sesión de SQLAlchemy para las operaciones de base de datos
    dentro de las rutas de la API, asegurando que la sesión se cierre
    correctamente después de cada solicitud.

    Yields:
        Una instancia de `AsyncSession`.

    Raises:
        AssertionError: Si `AsyncSessionLocal` no ha sido inicializado.
    """
    assert AsyncSessionLocal is not None, "AsyncSessionLocal no inicializado; llama init_db() en startup"
    async with AsyncSessionLocal() as session:
        yield session

async def check_db_connection() -> bool:
    """
    Realiza una consulta simple (SELECT 1) para verificar la conectividad de la base de datos.

    Returns:
        True si la conexión es exitosa, False en caso contrario.
    """
    assert engine is not None, "Engine no inicializado"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        # Registra stack trace completo para depuración
        logger.exception("DB healthcheck failed")
        return False