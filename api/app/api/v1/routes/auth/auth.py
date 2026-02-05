import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.auth.auth_models import Usuario
from app.core.security import verify_password, create_access_token
from app.api.v1.schemas.auth.usuario import UsuarioOut

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/auth", tags=["auth"])

# --- Schemas de Autenticación ---

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

# --- Endpoints ---

@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, session: AsyncSession = Depends(get_session)) -> TokenOut:
    """Valida credenciales y retorna un JWT."""
    try:
        stmt = select(Usuario).where(Usuario.email == data.email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
    except Exception:
        logger.exception("Error de base de datos durante el login")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error interno del servidor"
        )

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # El 'sub' debe ser siempre un string en JWT
    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token)


@router.get("/me", response_model=UsuarioOut)
async def get_me(current_user: Usuario = Depends(get_current_user)) -> UsuarioOut:
    """Retorna el perfil del usuario autenticado."""
    # model_validate es redundante aquí si response_model está definido, 
    # pero se deja si necesitas asegurar la conversión manual.
    return current_user