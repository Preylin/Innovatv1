import base64
import binascii
import logging
import pandas as pd
from io import BytesIO
from typing import Optional, Union, List

from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import delete, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_session
from app.core.deps import get_current_user
from app.models.modulos.administracion.monitoreo.matrices.models_matrices_monitoreo_administracion import (
    Cliente, Ubicacion, Chip
)
from app.api.v1.schemas.modulos.administracion.monitoreo.schema_clientes_ubicacion_chips_monitoreo_administracion import (
    ChipImportSchema, ClienteCreate, ClienteUpdate, ClienteOut, UbicacionCreate, ChipCreate, ChipUpdate, ChipOut
)

logger = logging.getLogger("uvicorn.error")

# ---------- HELPERS ----------

def decode_base64_image(data: Union[str, list, None]) -> Optional[bytes]:
    if not data: return None
    if isinstance(data, list) and data:
        img_obj = data[0]
        data = getattr(img_obj, "image_byte", img_obj.get("image_byte") if isinstance(img_obj, dict) else None)
    if not isinstance(data, str): return None
    try:
        if "base64," in data:
            data = data.split("base64,")[1]
        return base64.b64decode(data)
    except (binascii.Error, ValueError):
        return None

def raise_conflict_error(loc: str, msg: str):
    raise HTTPException(
        status_code=status.HTTP_412_PRECONDITION_FAILED,
        detail=[{"loc": [loc], "msg": msg, "type": "value_error"}]
    )

# ---------- ROUTER CLIENTES ----------

router_clientes = APIRouter(
    prefix="/clientes", tags=["clientes"],
    dependencies=[Depends(get_current_user)],
)

@router_clientes.post("", response_model=ClienteOut, status_code=201)
async def crear_cliente(data: ClienteCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Cliente(ruc=int(data.ruc), name=data.name)
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo, attribute_names=["ubicacion"])
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise_conflict_error("ruc", "RUC duplicado")

@router_clientes.get("", response_model=List[ClienteOut])
async def listar_clientes(session: AsyncSession = Depends(get_session)):
    stmt = select(Cliente).options(selectinload(Cliente.ubicacion)).order_by(Cliente.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_clientes.put("/{cliente_id}", response_model=ClienteOut)
async def actualizar_cliente(cliente_id: int, payload: ClienteUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    stmt = select(Cliente).where(Cliente.id == cliente_id).options(selectinload(Cliente.ubicacion))
    res = await session.execute(stmt)
    cliente = res.scalar_one_or_none()
    if not cliente: raise HTTPException(404, "Cliente no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if not data: return cliente

    try:
        if "ruc" in data: cliente.ruc = int(data["ruc"])
        if "name" in data: cliente.name = data["name"]

        if "ubicaciones" in data:
            incoming = data["ubicaciones"] or []
            desired = {u["name"].strip() for u in incoming if u.get("name") and u["name"].strip()}
            current = {u.name for u in cliente.ubicacion}

            for name in (desired - current):
                session.add(Ubicacion(name=name, cliente_id=cliente.id))
            
            if current - desired:
                await session.execute(
                    delete(Ubicacion).where(
                        Ubicacion.cliente_id == cliente.id,
                        Ubicacion.name.in_(list(current - desired))
                    )
                )

        await session.commit()
        await session.refresh(cliente)
        return cliente
    except IntegrityError:
        await session.rollback()
        raise_conflict_error("ruc", "RUC duplicado")

@router_clientes.delete("/{cliente_id}", status_code=204)
async def eliminar_cliente(cliente_id: int, session: AsyncSession = Depends(get_session)):
    cliente = await session.get(Cliente, cliente_id)
    if not cliente: raise HTTPException(404, "Cliente no encontrado")
    try:
        await session.delete(cliente)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(409, "Error de integridad al eliminar")

# ---------- ROUTER UBICACIONES ----------

router_ubicaciones = APIRouter(
    prefix="/ubicaciones", tags=["ubicaciones"],
    dependencies=[Depends(get_current_user)],
)

@router_ubicaciones.post("", status_code=201)
async def crear_ubicaciones(data: UbicacionCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevas = [Ubicacion(name=ub.name, cliente_id=data.cliente_id) for ub in data.ubicaciones]
        session.add_all(nuevas)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(422, detail=[{"loc": ["body", "ubicaciones", 0, "name"], "msg": "Ubicación duplicada", "type": "value_error"}])

# ---------- ROUTER CHIPS ----------

router_chips = APIRouter(
    prefix="/chips", tags=["chips"],
    dependencies=[Depends(get_current_user)],
)

@router_chips.post("", response_model=ChipOut, status_code=status.HTTP_201_CREATED)
async def crear_chip(data: ChipCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = Chip(
            numero=int(data.numero),
            iccid=data.iccid,
            operador=data.operador,
            mb=data.mb,
            activacion=data.activacion,
            instalacion=data.instalacion,
            adicional=data.adicional,
            status=data.status,
            imagen1=decode_base64_image(data.imagen1),
            imagen2=decode_base64_image(data.imagen2)
        )
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(412, detail=[
            {"loc": ["numero"], "msg": "Número duplicado", "type": "value_error"},
            {"loc": ["iccid"], "msg": "ICCID duplicado", "type": "value_error"}
        ])

@router_chips.post("/import", status_code=status.HTTP_201_CREATED)
async def import_chips(file: UploadFile = File(...), session: AsyncSession = Depends(get_session)):
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(400, "Formato no soportado")

    content = await file.read()
    df = pd.read_excel(BytesIO(content), engine="openpyxl", dtype={"numero": "int64", "iccid": "string", "operador": "string", "mb": "string"})
    df = df.where(pd.notna(df), None)
    
    rows = df.to_dict(orient="records")
    chips, errors = [], []

    for idx, row in enumerate(rows):
        try:
            chips.append(ChipImportSchema(**row))
        except ValidationError as e:
            errors.append({"row": idx + 2, "errors": e.errors()})

    if errors: raise HTTPException(422, {"message": "Errores de validación", "errors": errors})

    # Duplicados internos y BD
    seen_num, seen_icc = set(), set()
    for idx, c in enumerate(chips):
        if c.numero in seen_num or c.iccid in seen_icc:
            raise HTTPException(422, "Duplicados encontrados en el archivo")
        seen_num.add(c.numero)
        seen_icc.add(c.iccid)

    # Detección en BD
    res = await session.execute(select(Chip.numero, Chip.iccid).where((Chip.numero.in_(list(seen_num))) | (Chip.iccid.in_(list(seen_icc)))))
    if res.all():
        raise HTTPException(409, "Conflictos con registros existentes en la base de datos")

    await session.execute(insert(Chip), [c.model_dump() for c in chips])
    await session.commit()
    return {"status": "success", "inserted": len(chips)}

@router_chips.get("", response_model=List[ChipOut])
async def listar_chips(session: AsyncSession = Depends(get_session)):
    stmt = select(Chip).order_by(Chip.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_chips.put("/{chip_id}", response_model=ChipOut)
async def actualizar_chip(chip_id: int, payload: ChipUpdate = Body(...), session: AsyncSession = Depends(get_session)):
    chip = await session.get(Chip, chip_id)
    if not chip: raise HTTPException(404, "Chip no encontrado")

    data = payload.model_dump(exclude_unset=True)

    try:
        for fld, val in data.items():
            if fld.startswith("imagen") and val is not None:
                val = decode_base64_image(val)
            setattr(chip, fld, val)
            
        await session.commit()
        await session.refresh(chip)
        return chip
    except IntegrityError:
        await session.rollback()
        raise_conflict_error("numero/iccid", "Datos duplicados")

@router_chips.delete("/{chip_id}", status_code=204)
async def eliminar_chip(chip_id: int, session: AsyncSession = Depends(get_session)):
    chip = await session.get(Chip, chip_id)
    if not chip: raise HTTPException(404, "Chip no encontrado")
    try:
        await session.delete(chip)
        await session.commit()
    except Exception:
        await session.rollback()
        raise HTTPException(500, "Error al eliminar")