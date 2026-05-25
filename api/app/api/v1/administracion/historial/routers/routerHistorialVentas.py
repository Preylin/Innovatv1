from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Importaciones de tus archivos
from app.core.deps import get_current_user
from app.core.db import get_session

from app.api.v1.administracion.historial.schemas.shemaHistorialVentas import ListaHistorialVentas
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalCliente import GlobalCliente
from app.api.v1.contabilidad.ventas.modelVentas import Venta



router_administracion_historial_ventas = APIRouter(
    prefix="/administracion/historial",
    tags=["administracion/historial"],
    dependencies=[Depends(get_current_user)]
)


@router_administracion_historial_ventas.get("/ventas", response_model=list[ListaHistorialVentas])
async def obtener_historial_ventas(db: AsyncSession = Depends(get_session)):
    query = select(
        Venta.id, Venta.fecha_emision, Venta.tipo_cp_codigo, Venta.serie, Venta.numero,
        GlobalCliente.tipo_documento, GlobalCliente.nro_documento, GlobalCliente.razon_social,
        Venta.base_imponible, Venta.igv, Venta.total, Venta.moneda, Venta.tipo_cambio, Venta.categoria, Venta.descripcion_comprobante
    ).join(GlobalCliente, Venta.cliente_id == GlobalCliente.id, isouter=True)

    query = query.order_by(Venta.fecha_emision.asc())

    result = await db.execute(query)
    return result.mappings().all()