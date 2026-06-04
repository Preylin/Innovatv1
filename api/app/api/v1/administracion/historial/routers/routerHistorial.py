from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

# Importaciones de tus archivos
from app.core.deps import get_current_user
from app.core.db import get_session

from app.api.v1.administracion.historial.schemas.shemaHistorial import ListaHistorialVentas, ListaHistorialCompras
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalCliente import GlobalCliente
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalProveedor import GlobalProveedor
from app.api.v1.contabilidad.ventas.modelVentas import Venta
from app.api.v1.contabilidad.compras.modelCompras import Compra




router_administracion_historial = APIRouter(
    prefix="/administracion/historial",
    tags=["administracion/historial"],
    dependencies=[Depends(get_current_user)]
)


@router_administracion_historial.get("/ventas", response_model=list[ListaHistorialVentas])
async def obtener_historial_ventas(db: AsyncSession = Depends(get_session)):
    query = select(
        Venta.id, Venta.fecha_emision, Venta.tipo_cp_codigo, Venta.serie, Venta.numero,
        GlobalCliente.tipo_documento, GlobalCliente.nro_documento, GlobalCliente.razon_social,
        Venta.base_imponible, Venta.igv, Venta.total, Venta.moneda, Venta.tipo_cambio, Venta.categoria, Venta.descripcion_comprobante
    ).join(GlobalCliente, Venta.cliente_id == GlobalCliente.id, isouter=True)

    query = query.order_by(Venta.fecha_emision.asc())

    try:
        result = await db.execute(query)
        resultados = result.mappings().all()
        return resultados if resultados else []
    
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al obtener los registros: {str(e)}"
        )


@router_administracion_historial.get("/compras", response_model=list[ListaHistorialCompras])
async def obtener_historial_compras(db: AsyncSession = Depends(get_session)):
    query = select(
        Compra.id, Compra.fecha_emision, Compra.descripcion_comprobante, Compra.tipo_cp_codigo, Compra.serie, Compra.numero,
        GlobalProveedor.nro_documento, GlobalProveedor.razon_social, Compra.base_imponible, Compra.igv, Compra.no_gravadas, Compra.otros, Compra.total, Compra.moneda, Compra.tipo_cambio
    ).join(GlobalProveedor, Compra.proveedor_id == GlobalProveedor.id, isouter=True)

    query = query.order_by(Compra.fecha_emision.asc())

    try:
        result = await db.execute(query)
        resultados = result.mappings().all()
        return resultados if resultados else []
    
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al obtener los registros: {str(e)}"
        )