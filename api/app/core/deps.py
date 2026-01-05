# app/core/deps.py
"""
Módulo de dependencias para FastAPI.

Contiene funciones de dependencia que se utilizan para inyectar
objetos en las rutas de la API, como la sesión de base de datos
y el usuario autenticado.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.security import decode_access_token
from app.core.db import get_session
from app.models.auth.auth_models import Usuario

reusable_oauth2 = HTTPBearer(auto_error=True)

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
    session: AsyncSession = Depends(get_session),
) -> Usuario:
    """
    Obtiene el usuario actual autenticado a partir de un token JWT.

    Esta función de dependencia:
    1. Extrae el token JWT de la cabecera de autorización.
    2. Decodifica el token para obtener el ID del usuario.
    3. Consulta la base de datos para cargar la instancia ORM `Usuario`
       junto con sus permisos (`selectinload`).
    4. Realiza validaciones de seguridad:
       - Lanza un error 401 si el token es inválido o expirado.
       - Lanza un error 401 si el usuario no es encontrado.
       - Lanza un error 403 si el estado del usuario no es "activo" (es decir, está bloqueado).

    Args:
        creds: Credenciales de autorización HTTP, inyectadas por `HTTPBearer`.
        session: Sesión de base de datos asíncrona, inyectada por `get_session`.

    Returns:
        La instancia ORM `Usuario` del usuario autenticado, con sus permisos ya cargados.

    Raises:
        HTTPException:
            - 401 (UNAUTHORIZED): Si el token es inválido, expirado o el usuario no existe.
            - 403 (FORBIDDEN): Si el usuario está bloqueado.
    """
    token = creds.credentials
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    stmt = (
        select(Usuario)
        .where(Usuario.id == user_id)
        .options(selectinload(Usuario.permisos))
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    if user.estado != "activo":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario bloqueado")

    return user
