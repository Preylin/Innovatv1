# app/api/v1/routers/usuarios.py
import logging
from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.schemas.auth.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.core.db import get_session
from app.core.deps import get_current_user
from app.core.security import hash_password
from app.models.auth.auth_models import Permiso, Usuario
import base64
import binascii

logger = logging.getLogger("uvicorn.error")
router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(get_current_user)],  # protege todas las rutas; quitar si quieres control por endpoint
)

def usuario_to_out(u: Usuario) -> UsuarioOut:
    return UsuarioOut(
        id=u.id,
        name=u.name,
        last_name=u.last_name,
        email=u.email,
        cargo=u.cargo,
        estado=u.estado,
        image_base64=(
            base64.b64encode(u.imagen).decode("utf-8")
            if u.imagen else None
        ),
        permisos=[
            {
                "id": p.id,
                "name_module": p.name_module,
                "usuario_id": p.usuario_id,
                "created_at": p.created_at,
            }
            for p in u.permisos
        ] if u.permisos else [],
        created_at=u.created_at,
    )

def decode_base64_image(data: str | None) -> bytes | None:
    if not data:
        return None
    try:
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        return None

# Crear usuario (POST)
@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
    data: UsuarioCreate,
    session: AsyncSession = Depends(get_session),
):
    try:
        nuevo = Usuario(
            name=data.name,
            last_name=data.last_name,
            email=str(data.email),
            password_hash=hash_password(data.password),
            cargo=data.cargo,
            estado=data.estado,
            imagen=decode_base64_image(data.image_byte),
        )
        session.add(nuevo)
        await session.flush()

        session.add_all(
            Permiso(
                name_module=p.name_module,
                usuario_id=nuevo.id,
            )
            for p in data.permisos
        )

        await session.commit()
        await session.refresh(nuevo, attribute_names=["permisos"])

        return UsuarioOut.model_validate(nuevo)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[
                {
                    "loc": ["email"],
                    "msg": "Email duplicado",
                    "type": "value_error",
                }
            ],
        )

# -------------------------
# Listar usuarios (GET)
# -------------------------
@router.get("", response_model=list[UsuarioOut])
async def listar_usuarios(
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(Usuario)
        .options(selectinload(Usuario.permisos))
        .order_by(Usuario.id)
    )
    result = await session.execute(stmt)
    users = result.scalars().all()

    return [usuario_to_out(u) for u in users]

# -------------------------
# Obtener usuario por id (GET)
# -------------------------
@router.get("/{usuario_id}", response_model=UsuarioOut)
async def obtener_usuario(
    usuario_id: int,
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(Usuario)
        .where(Usuario.id == usuario_id)
        .options(selectinload(Usuario.permisos))
    )

    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    try:
        return UsuarioOut.model_validate(user)
    except ValidationError as ve:
        logger.error(
            "Pydantic validation error serializing usuario %s: %s",
            usuario_id,
            ve.errors(),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error serializando usuario",
        ) from ve

# -------------------------
# PUT: actualizar usuario
# -------------------------
@router.put("/{usuario_id}", response_model=UsuarioOut)
async def actualizar_usuario(
    usuario_id: int,
    payload: UsuarioUpdate = Body(...),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(Usuario)
        .where(Usuario.id == usuario_id)
        .options(selectinload(Usuario.permisos))
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = payload.model_dump(exclude_unset=True)

    if not data:
        return UsuarioOut.model_validate(user)

    try:
        # campos simples
        for fld in ("name", "last_name", "cargo", "estado", "email"):
            if fld in data:
                setattr(user, fld, data[fld])

        # password
        if data.get("password"):
            user.password_hash = hash_password(data["password"])

        # imagen
        if "image_byte" in data:
            user.imagen = decode_base64_image(data["image_byte"])

        # permisos
        if "permisos" in data:
            incoming = data["permisos"] or []
            desired = {p["name_module"] for p in incoming if p}

            q = select(Permiso).where(Permiso.usuario_id == user.id)
            res = await session.execute(q)
            current = res.scalars().all()
            current_modules = {p.name_module for p in current}

            for module in desired - current_modules:
                session.add(Permiso(name_module=module, usuario_id=user.id))

            if current_modules - desired:
                await session.execute(
                    delete(Permiso).where(
                        Permiso.usuario_id == user.id,
                        Permiso.name_module.in_(list(current_modules - desired)),
                    )
                )

        await session.commit()
        await session.refresh(user)

    except IntegrityError as ie:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[
                {
                    "loc": ["email"],
                    "msg": "Email duplicado",
                    "type": "value_error",
                }
            ],
        ) from ie

    except Exception as e:
        await session.rollback()
        logger.exception("Error actualizando usuario")
        raise HTTPException(
            status_code=500,
            detail="No se pudo actualizar el usuario",
        ) from e

    return UsuarioOut.model_validate(user)

# -------------------------
# DELETE: eliminar usuario
# -------------------------
@router.delete("/{usuario_id}",status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(
    usuario_id: int,
    session: AsyncSession = Depends(get_session),
):
    usuario = await session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    try:
        await session.delete(usuario)
        await session.commit()

    except IntegrityError as ie:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar el usuario por restricciones de integridad",
        ) from ie

    except Exception as e:
        await session.rollback()
        logger.exception("Error eliminando usuario")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al eliminar el usuario",
        ) from e

    return  # 204
