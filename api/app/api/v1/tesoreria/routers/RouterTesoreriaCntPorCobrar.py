from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.db import get_session
from app.api.v1.tesoreria.schemas.SchemaTesoreriaCntPorCobrar import CuentasPorCobrarMensualRead
from app.api.v1.contabilidad.ventas.modelVentas import Venta, CajaMovimientoVenta
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalCliente import GlobalCliente




router_tesoreria_cuentasporcobrar = APIRouter(
    prefix="/tesoreria-cuentasporcobrar",
    tags=["tesoreria-cuentasporcobrar"],
    dependencies=[Depends(get_current_user)],
)



@router_tesoreria_cuentasporcobrar.get("/resumen-mensual", response_model=List[CuentasPorCobrarMensualRead])
async def get_resumen(year: str, db: AsyncSession = Depends(get_session)):
    periodo_like = f"{year}%" 

    query = (
        select(
            Venta.id,
            Venta.periodo,
            Venta.fecha_emision,
            Venta.fecha_vencimiento,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social,
            Venta.total,
            Venta.monto_retencion,
            Venta.monto_detraccion,
            Venta.moneda,
            Venta.tipo_cambio,
            CajaMovimientoVenta.fecha_pago,
            func.coalesce(CajaMovimientoVenta.monto_pagado, 0.00).label("monto_pagado"),
            func.coalesce(CajaMovimientoVenta.status_cobro, 'PENDIENTE').label("status_cobro"),
            Venta.link_pdf
        )
        .join(GlobalCliente, Venta.cliente_id == GlobalCliente.id)
        .outerjoin(CajaMovimientoVenta, Venta.id == CajaMovimientoVenta.venta_id)
        .where(
            Venta.periodo.like(periodo_like),
            Venta.is_active == '1',
        )
        .order_by(Venta.fecha_emision.asc())
    )

    result = await db.execute(query)
    return result.mappings().all()