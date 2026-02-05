# app/core/config.py
"""
Módulo para la configuración de la aplicación.

Gestiona la carga de variables de entorno y define la configuración
general de la aplicación, incluyendo la conexión a la base de datos
y los parámetros de seguridad JWT.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class ConfigSettings(BaseSettings):
    """
    Clase de configuración de la aplicación.

    Carga las variables de entorno desde el archivo .env y las valida.
    Define los parámetros necesarios para la conexión a la base de datos
    y la configuración de los tokens JWT.
    """
    DATABASE_URL: str = Field(..., description="URL de conexión a la base de datos PostgreSQL.")
    DB_STATEMENT_TIMEOUT_MS: int = Field(..., description="Tiempo máximo de espera para las sentencias de la base de datos en milisegundos.")
    DB_POOL_SIZE: int = Field(..., description="Número de conexiones persistentes en el pool de la base de datos.")
    DB_MAX_OVERFLOW: int = Field(..., description="Número máximo de conexiones que pueden exceder el tamaño del pool.")
    DB_POOL_RECYCLE: int = Field(..., description="Tiempo en segundos después del cual las conexiones del pool son recicladas.")
    JWT_SECRET_KEY: str = Field(..., min_length=32, description="Clave secreta para firmar los tokens JWT. Debe tener al menos 32 caracteres.")
    JWT_ALG: str = Field(..., description="Algoritmo de cifrado utilizado para los tokens JWT.")
    JWT_EXPIRE_MINUTES: int = Field(..., description="Tiempo de expiración de los tokens JWT en minutos.")
    REDIS_URL: str = Field(..., description="URL de Redis")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = ConfigSettings()
