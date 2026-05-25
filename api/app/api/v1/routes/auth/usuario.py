import base64
import binascii
import logging
from typing import List, Optional, Union
from app.core.realtime import redis_client

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.schemas.auth.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.core.db import get_session
from app.core.deps import get_current_user
from app.core.security import hash_password
from app.models.auth.auth_models import Permiso, Usuario

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(get_current_user)],
)

# --- Helpers ---

def decode_base64_image(data: Optional[str]) -> Optional[bytes]:
    """Decodifica un string base64 directo manejando el prefijo Data URI."""
    if not data or not isinstance(data, str):
        return None

    try:
        if "base64," in data:
            data = data.split("base64,")[1]
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        logger.error("Error al decodificar la imagen en base64")
        return None

def raise_duplicate_email():
    """Lanza error estandarizado de email duplicado."""
    raise HTTPException(
        status_code=status.HTTP_412_PRECONDITION_FAILED,
        detail=[{"loc": ["email"], "msg": "Email duplicado", "type": "value_error"}],
    )

# --- Rutas ---

@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
async def crear_usuario(data: UsuarioCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Usuario(
            name=data.name,
            last_name=data.last_name,
            email=str(data.email),
            password_hash=hash_password(data.password),
            cargo=data.cargo,
            estado=data.estado,
            imagen=decode_base64_image(data.image_byte), # Ahora procesa el string limpio
        )
        session.add(nuevo)
        await session.flush()

        if data.permisos:
            # Si en tu Pydantic 'permisos' pasó a ser una lista de strings (ej: ["almacen"])
            # lo iteramos directamente mapeándolo al modelo Permiso de SQLAlchemy:
            session.add_all(
                Permiso(name_module=p, usuario_id=nuevo.id)
                for p in data.permisos
            )

        await session.commit()
        await session.refresh(nuevo, attribute_names=["permisos"])
        return nuevo

    except IntegrityError:
        await session.rollback()
        raise_duplicate_email()

@router.get("", response_model=List[UsuarioOut])
async def listar_usuarios(session: AsyncSession = Depends(get_session)):
    stmt = select(Usuario).options(selectinload(Usuario.permisos)).order_by(Usuario.id)
    result = await session.execute(stmt)
    return result.scalars().all()

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

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return user

    try:
        # Campos directos
        for field in ("name", "last_name", "cargo", "estado", "email"):
            if field in update_data:
                setattr(user, field, update_data[field])

        if "password" in update_data and update_data["password"]:
            user.password_hash = hash_password(update_data["password"])

        if "image_byte" in update_data:
            user.imagen = decode_base64_image(update_data["image_byte"])

        # Lógica de Permisos Sincronizada (Ahora trabaja puramente con Sets de Strings)
        if "permisos" in update_data:
            incoming_modules = {p.strip() for p in update_data["permisos"] if p}
            current_modules = {p.name_module for p in user.permisos}

            # Agregar nuevos
            for module in (incoming_modules - current_modules):
                session.add(Permiso(name_module=module, usuario_id=user.id))

            # Eliminar sobrantes
            modules_to_del = current_modules - incoming_modules
            if modules_to_del:
                await session.execute(
                    delete(Permiso).where(
                        Permiso.usuario_id == user.id,
                        Permiso.name_module.in_(modules_to_del)
                    )
                )

        await session.commit()
        # Forzamos re-fetch de relaciones tras modificaciones directas de delete/insert
        await session.refresh(user, attribute_names=["permisos"]) 
        return user

    except IntegrityError:
        await session.rollback()
        raise_duplicate_email()
    except Exception as e:
        await session.rollback()
        logger.exception(f"Error actualizando usuario {usuario_id}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar")


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(usuario_id: int, session: AsyncSession = Depends(get_session)):
    usuario = await session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    try:
        await session.delete(usuario)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Restricción de integridad al eliminar")
    except Exception:
        await session.rollback()
        logger.exception(f"Error eliminando usuario {usuario_id}")
        raise HTTPException(status_code=500, detail="Error interno al eliminar")
    
    

@router.get("/online", response_model=List[UsuarioOut])
async def obtener_usuarios_online(
    session: AsyncSession = Depends(get_session)
):
    cursor = 0
    online_ids = set() # Usar un set evita IDs duplicados si el SCAN repite alguno

    try:
        while True:
            # El count=100 le dice a Redis que devuelva aproximadamente 100 llaves por paso
            cursor, keys = await redis_client.scan(cursor, match="user:online:*", count=100)
            for k in keys:
                # Si redis_client no tiene decode_responses=True, k será bytes
                key_str = k.decode("utf-8") if isinstance(k, bytes) else k
                try:
                    user_id = int(key_str.split(":")[-1])
                    online_ids.add(user_id)
                except (ValueError, IndexError):
                    continue
            
            if cursor == 0:
                break

        if not online_ids:
            return []

        # Consulta a la DB
        stmt = (
            select(Usuario)
            .where(Usuario.id.in_(list(online_ids)))
            .options(selectinload(Usuario.permisos))
            .order_by(Usuario.name) # Opcional: ordenar alfabéticamente
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    except Exception as e:
        logger.error(f"Error al obtener usuarios online: {e}")
        return []