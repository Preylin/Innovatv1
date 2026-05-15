from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.db import get_session
from app.api.v1.tesoreria.schemas.SchemaTesoreriaCntPorCobrar import CuentasPorCobrarMensualRead
from app.api.v1.contabilidad.ventas.modelVentas import Venta, ClienteVentas, CajaMovimientoVenta




router_tesoreria_cuentasporcobrar = APIRouter(
    prefix="/tesoreria-cuentasporcobrar",
    tags=["tesoreria-cuentasporcobrar"],
    dependencies=[Depends(get_current_user)],
)



@router_tesoreria_cuentasporcobrar.get("/resumen-mensual", response_model=List[CuentasPorCobrarMensualRead])
async def get_resumen(periodo: date, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            Venta.id,
            Venta.periodo,
            Venta.fecha_emision,
            Venta.fecha_vencimiento,
            ClienteVentas.nro_documento,
            ClienteVentas.razon_social,
            Venta.total,
            Venta.moneda,
            Venta.tipo_cambio,
            CajaMovimientoVenta.fecha_pago,
            # Si es nulo, devuelve 0.0
            func.coalesce(CajaMovimientoVenta.monto_pagado,
                          0.0).label("monto_pagado"),
            func.coalesce(CajaMovimientoVenta.status_cobro,
                          'PENDIENTE').label("status_cobro"),
            Venta.link_pdf
        )
        .join(ClienteVentas, Venta.cliente_id == ClienteVentas.id)
        # Aquí aplicamos el LEFT OUTER JOIN
        .outerjoin(CajaMovimientoVenta, Venta.id == CajaMovimientoVenta.venta_id)
        .where(Venta.periodo == periodo)
        .order_by(Venta.fecha_emision.desc())
    )

    result = await db.execute(query)

    return result.mappings().all()