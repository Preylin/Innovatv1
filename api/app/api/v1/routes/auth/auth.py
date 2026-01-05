# app/api/v1/routes/auth/auth.py
"""
Módulo para la autenticación de usuarios.
Este módulo define los endpoints para el inicio de sesión y la obtención
de información del usuario autenticado.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, ValidationError

from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.auth.auth_models import Usuario
from app.core.security import verify_password, create_access_token
from app.api.v1.schemas.auth.usuario import UsuarioOut

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/auth", tags=["auth"])


class TokenOut(BaseModel):
    """
    Modelo de salida para el token de acceso.
    """
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    """
    Modelo de entrada para el inicio de sesión.
    """
    email: EmailStr
    password: str


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, session: AsyncSession = Depends(get_session)) -> TokenOut:
    """
    Endpoint para iniciar sesión.

    Valida las credenciales del usuario (email y contraseña) y, si son correctas,
    devuelve un token de acceso JWT.

    El token contiene el 'sub' (subject) con el ID del usuario, que se utiliza
    para identificar al usuario en las solicitudes posteriores.

    Args:
        data: Un objeto `LoginIn` con el email y la contraseña.
        session: La sesión de base de datos asíncrona.

    Returns:
        Un objeto `TokenOut` con el `access_token` y el `token_type`.

    Raises:
        HTTPException:
            - 401 (UNAUTHORIZED): Si las credenciales son inválidas.
            - 500 (INTERNAL_SERVER_ERROR): Si ocurre un error en la base de datos.
    """
    try:
        q = await session.execute(select(Usuario).where(Usuario.email == data.email))
        user = q.scalar_one_or_none()
    except Exception:
        logger.exception("DB error en login")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno")

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generar token con 'sub' estandar
    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token)


@router.get("/me", response_model=UsuarioOut)
async def get_me(current_user: Usuario = Depends(get_current_user)) -> UsuarioOut:
    """
    Endpoint para obtener la información del usuario autenticado.

    Devuelve los datos del usuario que realiza la solicitud, utilizando el token
    JWT proporcionado en la cabecera de autorización.

    La dependencia `get_current_user` se encarga de validar el token y obtener
    el usuario de la base de datos.

    Args:
        current_user: El objeto `Usuario` del usuario autenticado, inyectado por FastAPI.

    Returns:
        Un objeto `UsuarioOut` con la información pública del usuario.

    Raises:
        HTTPException:
            - 500 (INTERNAL_SERVER_ERROR): Si ocurre un error al serializar los datos del usuario.
    """
    try:
        return UsuarioOut.model_validate(current_user)
    except ValidationError as ve:
        logger.error("ValidationError serializando usuario autenticado: %s", ve.errors())
        raise HTTPException(status_code=500, detail="Error serializando usuario autenticado") from ve
