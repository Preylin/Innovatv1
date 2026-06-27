from decimal import Decimal
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, desc, func, select, text
import pandas as pd
import io
from app.core.deps import get_current_user
from app.core.db import get_session

from app.api.v1.administracion.globalClienteProveedor.modelGlobalCliente import GlobalCliente
from app.api.v1.administracion.monitoreo.models.model_ubicaciones import TablaUbicacionesMonitoreo
from app.api.v1.administracion.globalClienteProveedor.schema_clientes_global import ClienteOutShort, UbicacionOut


router_clientes_global = APIRouter(prefix="/clientes-global", tags=["Clientes Global"], dependencies=[Depends(get_current_user)])

@router_clientes_global.get("/mostrar-short", response_model=List[ClienteOutShort], status_code=status.HTTP_200_OK)
async def mostrar_clientes_global(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            GlobalCliente.id,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social
        )
        .order_by(GlobalCliente.razon_social.asc())
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router_clientes_global.get("/mostrar-ubicaciones-monitoreo", response_model=List[UbicacionOut], status_code=status.HTTP_200_OK)
async def mostrar_ubicaciones_monitoreo(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            TablaUbicacionesMonitoreo.id,
            TablaUbicacionesMonitoreo.ubicacion
        )
        .order_by(TablaUbicacionesMonitoreo.ubicacion.asc())
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")