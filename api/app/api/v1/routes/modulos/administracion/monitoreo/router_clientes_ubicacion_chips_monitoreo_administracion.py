import base64
import binascii
from io import BytesIO
import pandas as pd
import logging
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy import delete, insert, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.modulos.administracion.monitoreo.matrices.models_matrices_monitoreo_administracion import Cliente, Ubicacion, Chip, ImagenChips
from app.api.v1.schemas.modulos.administracion.monitoreo.schema_clientes_ubicacion_chips_monitoreo_administracion import (
    ChipImportSchema, ClienteCreate, ClienteUpdate, ClienteOut, UbicacionCreate, UbicacionOut, ChipCreate, ChipUpdate, ChipOut, ImagenChipsOut
)

logger = logging.getLogger("uvicorn.error")


# ---------- FUNCIONES DE HELPER ----------

def decode_base64_image(data: str | None) -> bytes | None:
    if not data:
        return None
    try:
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        return None


def cliente_to_out(u: Cliente) -> ClienteOut:
    return ClienteOut(
        id=u.id,
        ruc=str(u.ruc),
        name=u.name,
        created_at=u.created_at,
        ubicaciones=[
            UbicacionOut(
                id=ub.id,
                name=ub.name,
                cliente_id=ub.cliente_id,
                created_at=ub.created_at
            )
            for ub in u.ubicacion
        ] if u.ubicacion else []
    )


def chip_to_out(u: Chip) -> ChipOut:
    return ChipOut(
        id=u.id,
        numero=u.numero,
        iccid=u.iccid,
        operador=u.operador,
        mb=u.mb,
        activacion=u.activacion,
        instalacion=u.instalacion,
        adicional=u.adicional,
        created_at=u.created_at,
        status=u.status,
        imagen=[
            ImagenChipsOut(
                id=img.id,
                chip_id=img.chip_id,
                image_base64=base64.b64encode(img.image_byte).decode() if img.image_byte else None,
                created_at=img.created_at
            )
            for img in u.imagen
        ] if u.imagen else []
    )


# ---------- ROUTER CLIENTES ----------

router_clientes = APIRouter(
    prefix="/clientes",
    tags=["clientes"],
    dependencies=[Depends(get_current_user)],
)


@router_clientes.post("", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
async def crear_cliente(data: ClienteCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Cliente(ruc=int(data.ruc), name=data.name)
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)

        return cliente_to_out(nuevo)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[
                {"loc": ["ruc"], "msg": "RUC duplicado", "type": "value_error"}
            ]
        )


@router_clientes.get("", response_model=list[ClienteOut])
async def listar_clientes(session: AsyncSession = Depends(get_session)):
    stmt = select(Cliente).options(selectinload(Cliente.ubicacion)).order_by(Cliente.id)
    result = await session.execute(stmt)
    clientes = result.scalars().all()
    return [cliente_to_out(c) for c in clientes]


@router_clientes.put("/{cliente_id}", response_model=ClienteOut)
async def actualizar_cliente(cliente_id: int, payload: ClienteUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    stmt = select(Cliente).where(Cliente.id == cliente_id).options(selectinload(Cliente.ubicacion))
    result = await session.execute(stmt)
    cliente = result.scalar_one_or_none()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return cliente_to_out(cliente)

    try:
        for fld in ("ruc", "name"):
            if fld not in data:
                continue

            if fld == "ruc":
                cliente.ruc = int(data[fld])
            else:
                setattr(cliente, fld, data[fld])

        # Ubicaciones
        if "ubicaciones" in data:
            incoming = data["ubicaciones"] or []
            desired_names = {u["name"].strip() for u in incoming if u and u.get("name") and u["name"].strip()}
            current_names = {u.name for u in cliente.ubicacion}

            for name in desired_names - current_names:
                session.add(Ubicacion(name=name, cliente_id=cliente.id))
            if current_names - desired_names:
                await session.execute(
                    delete(Ubicacion).where(
                        Ubicacion.cliente_id == cliente.id,
                        Ubicacion.name.in_(list(current_names - desired_names))
                    )
                )

        await session.commit()
        await session.refresh(cliente)

        return cliente_to_out(cliente)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[{"loc": ["ruc"], "msg": "RUC duplicado", "type": "value_error"}]
        )

    except Exception as e:
        await session.rollback()
        logger.exception("Error actualizando cliente")
        raise HTTPException(status_code=500, detail="No se pudo actualizar el cliente") from e


@router_clientes.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cliente(cliente_id: int, session: AsyncSession = Depends(get_session)):
    cliente = await session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    try:
        await session.delete(cliente)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar el cliente por restricciones de integridad")
    except Exception as e:
        await session.rollback()
        logger.exception("Error eliminando cliente")
        raise HTTPException(status_code=500, detail="Error interno al eliminar el cliente")

#---- ROUTER UBICACIONES ----

rourter_ubicaciones = APIRouter(
    prefix="/ubicaciones",
    tags=["ubicaciones"],
    dependencies=[Depends(get_current_user)],
)

@rourter_ubicaciones.post("", status_code=status.HTTP_201_CREATED,)
async def crear_ubicaciones(data: UbicacionCreate, session: AsyncSession = Depends(get_session),
):
    try:
        nuevas = [
            Ubicacion(name=ub.name, cliente_id=data.cliente_id)
            for ub in data.ubicaciones
        ]
        session.add_all(nuevas)
        await session.commit()

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=422,
            detail=[
                { "loc": ["body", "ubicaciones", 0, "name"], 
                "msg": "Ubicación duplicada",
                "type": "value_error" }
            ]
        )

        raise



# ---------- ROUTER CHIPS ----------

router_chips = APIRouter(
    prefix="/chips",
    tags=["chips"],
    dependencies=[Depends(get_current_user)],
)


@router_chips.post("", response_model=ChipOut, status_code=status.HTTP_201_CREATED)
async def crear_chip(data: ChipCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Chip(
            numero=data.numero,
            iccid=data.iccid,
            operador=data.operador,
            mb=data.mb,
            activacion=data.activacion,
            instalacion=data.instalacion,
            adicional=data.adicional,
            status=data.status
        )
        session.add(nuevo)
        await session.flush()

        session.add_all(
            ImagenChips(image_byte=decode_base64_image(img.image_byte), chip_id=nuevo.id)
            for img in data.image_byte
        )

        await session.commit()
        await session.refresh(nuevo, attribute_names=["imagen"])

        return chip_to_out(nuevo)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[
                {"loc": ["numero"], "msg": "Numero duplicado", "type": "value_error"},
                {"loc": ["iccid"], "msg": "ICCID duplicado", "type": "value_error"}
            ]
        )


@router_chips.post("/import", status_code=201)
async def import_chips(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(400, "Formato no soportado")

    content = await file.read()
    await file.close()

    # ---------- LECTURA EXCEL ----------
    df = pd.read_excel(
        BytesIO(content),
        engine="openpyxl",
        dtype={
            "numero": "int64",
            "iccid": "string",
            "operador": "string",
            "mb": "string",
            "adicional": "string",
        },
    )

    df = df.where(pd.notna(df), None)
    df["iccid"] = df["iccid"].str.strip()
    df["numero"] = df["numero"].astype(int)

    rows = df.to_dict(orient="records")

    chips = []
    errors = []

    for idx, row in enumerate(rows):
        try:
            chips.append(ChipImportSchema(**row))
        except ValidationError as e:
            errors.append({"row": idx + 2, "errors": e.errors()})

    if errors:
        raise HTTPException(422, {"message": "Errores de validación", "errors": errors})

    # ---------- DUPLICADOS EN ARCHIVO ----------
    seen_numero = set()
    seen_iccid = set()
    duplicates = []

    for idx, chip in enumerate(chips):
        if chip.numero in seen_numero:
            duplicates.append({"row": idx + 2, "field": "numero"})
        if chip.iccid in seen_iccid:
            duplicates.append({"row": idx + 2, "field": "iccid"})
        seen_numero.add(chip.numero)
        seen_iccid.add(chip.iccid)

    if duplicates:
        raise HTTPException(422, {"message": "Duplicados en el archivo", "errors": duplicates})

    # =================================================
    # 🔴 DETECCIÓN REAL DE CONFLICTOS EN BASE DE DATOS
    # =================================================
    numeros = [c.numero for c in chips]
    iccids = [c.iccid for c in chips]

    result = await session.execute(
        select(Chip.numero, Chip.iccid)
        .where((Chip.numero.in_(numeros)) | (Chip.iccid.in_(iccids)))
    )

    conflicts = []
    existing = result.all()

    if existing:
        existing_numeros = {n for n, _ in existing}
        existing_iccids = {i for _, i in existing}

        for idx, chip in enumerate(chips):
            if chip.numero in existing_numeros:
                conflicts.append({"row": idx + 2, "field": "numero"})
            if chip.iccid in existing_iccids:
                conflicts.append({"row": idx + 2, "field": "iccid"})

    if conflicts:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Conflictos con registros existentes",
                "errors": conflicts,
            },
        )

    # ---------- INSERT ----------
    await session.execute(
        insert(Chip),
        [chip.model_dump() for chip in chips],
    )
    await session.commit()

    return {"status": "success", "inserted": len(chips)}


@router_chips.get("", response_model=list[ChipOut])
async def listar_chips(session: AsyncSession = Depends(get_session)):
    stmt = select(Chip).options(selectinload(Chip.imagen)).order_by(Chip.id)
    result = await session.execute(stmt)
    chips = result.scalars().all()
    return [chip_to_out(c) for c in chips]


@router_chips.put("/{chip_id}", response_model=ChipOut)
async def actualizar_chip(chip_id: int, payload: ChipUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    stmt = select(Chip).where(Chip.id == chip_id).options(selectinload(Chip.imagen))
    result = await session.execute(stmt)
    chip = result.scalar_one_or_none()

    if not chip:
        raise HTTPException(status_code=404, detail="Chip no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return chip_to_out(chip)

    try:
        # Campos simples
        for fld in ("numero", "iccid", "operador", "mb", "activacion", "instalacion", "adicional", "status", "imagen"):
            if fld in data:
                setattr(chip, fld, data[fld])

        await session.commit()
        await session.refresh(chip)
        return chip_to_out(chip)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=[
                {"loc": ["numero"], "msg": "Numero duplicado", "type": "value_error"},
                {"loc": ["iccid"], "msg": "ICCID duplicado", "type": "value_error"}
            ]
        )
    except Exception as e:
        await session.rollback()
        logger.exception("Error actualizando chip")
        raise HTTPException(status_code=500, detail="No se pudo actualizar el chip") from e


@router_chips.delete("/{chip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_chip(chip_id: int, session: AsyncSession = Depends(get_session)):
    chip = await session.get(Chip, chip_id)
    if not chip:
        raise HTTPException(status_code=404, detail="Chip no encontrado")
    try:
        await session.delete(chip)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar el chip por restricciones de integridad")
    except Exception as e:
        await session.rollback()
        logger.exception("Error eliminando chip")
        raise HTTPException(status_code=500, detail="Error interno al eliminar el chip")
