import logging
from typing import List
import pandas as pd
import io
from fastapi import UploadFile, File

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import insert, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.deps import get_current_user
from app.api.v1.schemas.modulos.gerencia.inicio.SchemaGerenciaInicioProvClient import ClienteCreate, ClienteOut, ClienteUpdate, ProveedorCreate, ProveedorOut, ProveedorUpdate
from app.models.modulos.gerencia.inicio.ModelsGerenciaInicioProvClient import ClienteInicio, ProveedorInicio

logger = logging.getLogger("uvicorn.error")

router_clientesGerenciaInicio = APIRouter(
    prefix="/clientesGerenciaInicio",
    tags=["clientesGerenciaInicio"],
    dependencies=[Depends(get_current_user)],
)

@router_clientesGerenciaInicio.post("", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
async def crear_cliente(data: ClienteCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = ClienteInicio(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED, detail=[
            {"loc": ["body", "ruc"], "msg": "RUC duplicado", "type": "value_error"},
        ])

@router_clientesGerenciaInicio.post("/import", status_code=status.HTTP_201_CREATED)
async def import_clientes(
    file: UploadFile = File(...), # Recibe el binario
    session: AsyncSession = Depends(get_session)
):
    # 1. Validar extensión
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel")

    try:
        # 2. Leer el binario en memoria
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # 3. Normalizar nombres de columnas y limpiar
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Validar que existan las columnas mínimas
        required = ["ruc", "cliente"]
        if not all(col in df.columns for col in required):
            raise HTTPException(status_code=400, detail= f"Columnas faltantes. Requeridas: {required}")

        # Limpieza básica
        df = df[required].dropna(subset=["ruc", "cliente"])
        df["ruc"] = df["ruc"].astype(str).str.strip()

        # 4. Validar duplicados internos en el Excel
        if df["ruc"].duplicated().any():
            raise HTTPException(422, "Existen RUCs duplicados dentro del archivo Excel")

        # 5. Validar contra la Base de Datos (Evitar Conflictos)
        rucs_en_excel = df["ruc"].tolist()
        query_existentes = await session.execute(
            select(ClienteInicio.ruc).where(ClienteInicio.ruc.in_(rucs_en_excel))
        )
        existentes = query_existentes.scalars().all()
        
        if existentes:
            raise HTTPException(status_code=409, detail= f"Los siguientes RUCs ya existen en la BD: {', '.join(existentes)}")
            
        # 6. Inserción masiva
        registros = df.to_dict(orient="records")
        await session.execute(insert(ClienteInicio), registros)
        await session.commit()

        return {"status": "success", "inserted": len(registros)}

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")


@router_clientesGerenciaInicio.get("", response_model=List[ClienteOut])
async def listar_clientes(session: AsyncSession = Depends(get_session)):
    stmt = select(ClienteInicio).order_by(ClienteInicio.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_clientesGerenciaInicio.put("/{cliente_id}", response_model=ClienteOut)
async def actualizar_cliente(
    cliente_id: int, 
    payload: ClienteUpdate, 
    session: AsyncSession = Depends(get_session)
):
    cliente = await session.get(ClienteInicio, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    data = payload.model_dump(exclude_unset=True)
    
    try:
        for key, value in data.items():
            setattr(cliente, key, value)
        
        await session.commit()
        await session.refresh(cliente)
        return cliente
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar")

@router_clientesGerenciaInicio.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cliente(cliente_id: int, session: AsyncSession = Depends(get_session)):
    cliente = await session.get(ClienteInicio, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(cliente)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")


router_proveedoresGerenciaInicio = APIRouter(
    prefix="/proveedoresGerenciaInicio",
    tags=["proveedoresGerenciaInicio"],
    dependencies=[Depends(get_current_user)],
)

@router_proveedoresGerenciaInicio.post("", response_model=ProveedorOut, status_code=status.HTTP_201_CREATED)
async def crear_proveedor(data: ProveedorCreate, session: AsyncSession = Depends(get_session)):
    try:
        nuevo = ProveedorInicio(**data.model_dump())
        session.add(nuevo)
        await session.commit()
        await session.refresh(nuevo)
        return nuevo
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED, detail=[
            {"loc": ["body", "ruc"], "msg": "RUC duplicado", "type": "value_error"},
        ])

@router_proveedoresGerenciaInicio.post("/import", status_code=status.HTTP_201_CREATED)
async def import_proveedores(
    file: UploadFile = File(...), # Recibe el binario
    session: AsyncSession = Depends(get_session)
):
    # 1. Validar extensión
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel")
    try:
        # 2. Leer el binario en memoria
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # 3. Normalizar nombres de columnas y limpiar
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Validar que existan las columnas mínimas
        required = ["ruc", "proveedor"]
        if not all(col in df.columns for col in required):
            raise HTTPException(status_code=400, detail= f"Columnas faltantes. Requeridas: {required}")

        # Limpieza básica
        df = df[required].dropna(subset=["ruc", "proveedor"])
        df["ruc"] = df["ruc"].astype(str).str.strip()

        # 4. Validar duplicados internos en el Excel
        if df["ruc"].duplicated().any():
            raise HTTPException(422, "Existen RUCs duplicados dentro del archivo Excel")

        # 5. Validar contra la Base de Datos (Evitar Conflictos)
        rucs_en_excel = df["ruc"].tolist()
        query_existentes = await session.execute(
            select(ProveedorInicio.ruc).where(ProveedorInicio.ruc.in_(rucs_en_excel))
        )
        existentes = query_existentes.scalars().all()

        if existentes:
            raise HTTPException(status_code=409, detail= f"Los siguientes RUCs ya existen en la BD: {', '.join(existentes)}")
            
        # 6. Inserción masiva
        registros = df.to_dict(orient="records")
        await session.execute(insert(ProveedorInicio), registros)
        await session.commit()

        return {"status": "success", "inserted": len(registros)}
    
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router_proveedoresGerenciaInicio.get("", response_model=List[ProveedorOut])
async def listar_proveedores(session: AsyncSession = Depends(get_session)):
    stmt = select(ProveedorInicio).order_by(ProveedorInicio.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_proveedoresGerenciaInicio.put("/{proveedor_id}", response_model=ProveedorOut)
async def actualizar_proveedor(
    proveedor_id: int, 
    payload: ProveedorUpdate, 
    session: AsyncSession = Depends(get_session)
):
    proveedor = await session.get(ProveedorInicio, proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    data = payload.model_dump(exclude_unset=True)

    try:
        for key, value in data.items():
            setattr(proveedor, key, value)
        
        await session.commit()
        await session.refresh(proveedor)
        return proveedor
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar")

@router_proveedoresGerenciaInicio.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_proveedor(proveedor_id: int, session: AsyncSession = Depends(get_session)):
    proveedor = await session.get(ProveedorInicio, proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    try:
        await session.delete(proveedor)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=404, detail="No se puede eliminar por restricciones de integridad")
