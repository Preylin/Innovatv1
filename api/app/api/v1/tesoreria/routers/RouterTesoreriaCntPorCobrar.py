from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


from app.core.deps import get_current_user
from app.core.db import get_session
from app.api.v1.tesoreria.schemas.SchemaTesoreriaCntPorCobrar import CuentasPorCobrarMensualRead, CuentasPorCobrarDetalleOnetoOneReadVentas, CuentasPorCobrarDetalleOnetoOneReadCajaVentas, RegistrarCobro, UpdateFechaPagoRetencionDetraccionSchema
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
            Venta.fecha_emision,
            Venta.fecha_vencimiento,
            Venta.serie,
            Venta.numero,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social,
            Venta.total,
            Venta.monto_retencion,
            Venta.monto_detraccion,
            Venta.moneda,
            Venta.tipo_cambio,
            # Sumamos todos los montos pagados de los movimientos y si no hay ninguno, devolvemos 0.00
            func.coalesce(func.sum(CajaMovimientoVenta.monto_pagado), 0.00).label("monto_pagado"),
            Venta.fecha_pago_detraccion_retencion,
            Venta.link_pdf
        )
        .join(GlobalCliente, Venta.cliente_id == GlobalCliente.id)
        .outerjoin(CajaMovimientoVenta, Venta.id == CajaMovimientoVenta.venta_id)
        .where(
            Venta.periodo.like(periodo_like),
            Venta.is_active == '1',
        )
        # Agrupamos por la venta y el cliente para que func.sum() y func.max() actúen por cada factura
        .group_by(
            Venta.id,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social
        )
        .order_by(Venta.fecha_emision.desc())
    )

    try:
        result = await db.execute(query)
        return result.mappings().all()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el resumen mensual: {str(e)}"
        )
    
@router_tesoreria_cuentasporcobrar.get("/detalle-ventas/{id}", response_model=CuentasPorCobrarDetalleOnetoOneReadVentas)
async def get_detalle_cuenta(id: int, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            Venta.id,
            Venta.periodo,
            Venta.fecha_emision,
            Venta.fecha_vencimiento,
            Venta.serie,
            Venta.numero,
            Venta.base_imponible,
            Venta.igv,
            Venta.total,
            Venta.tipo_cambio,
            Venta.moneda,
            Venta.monto_detraccion,
            Venta.monto_retencion,
            Venta.nro_orden_compra,
            Venta.nro_guia_remision,
            Venta.fecha_pago_detraccion_retencion,
            Venta.descripcion_comprobante,
        )
        .where(Venta.id == id)
    )

    try:
        result = await db.execute(query)
        registro = result.mappings().one_or_none()
        
        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró ningún registro con el ID {id}"
            )
            
        return registro

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al obtener el detalle: {str(e)}"
        )
    
@router_tesoreria_cuentasporcobrar.get("/detalle-caja-ventas/{id}", response_model=List[CuentasPorCobrarDetalleOnetoOneReadCajaVentas])
async def get_detalle_cuenta(id: int, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            CajaMovimientoVenta.id,
            CajaMovimientoVenta.fecha_pago,
            CajaMovimientoVenta.lugar_ingreso,
            CajaMovimientoVenta.monto_pagado,
            CajaMovimientoVenta.medio_pago,
            CajaMovimientoVenta.glosa_pago,
        )
        .where(CajaMovimientoVenta.venta_id == id)
    )

    try:
        result = await db.execute(query)
        registro = result.mappings().all()
        # sin bloque if que lanza error 404 devuelve [] y estado 200
        return registro

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al obtener el detalle: {str(e)}"
        )

@router_tesoreria_cuentasporcobrar.post("/registrar-cobro", status_code=status.HTTP_201_CREATED)
async def registrar_cobro(payload: RegistrarCobro, db: AsyncSession = Depends(get_session)):
    new_cobro = CajaMovimientoVenta(**payload.model_dump())

    try:
        db.add(new_cobro)
        await db.commit()
        await db.refresh(new_cobro)
        return new_cobro

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el cobro: {str(e)}"
        )


@router_tesoreria_cuentasporcobrar.delete("/eliminar-cobro/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cobro(id: int, db: AsyncSession = Depends(get_session)):
    cobro = await db.get(CajaMovimientoVenta, id)
    

    if not cobro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el cobro con ID {id}"
        )

    try:
        await db.delete(cobro)
        await db.commit()
        
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al eliminar el cobro: {str(e)}"
        )

    return None

# actualizar solo el campo Venta.fecha_pago_detraccion_retencion,


@router_tesoreria_cuentasporcobrar.put("/actualizar-fecha-pago-detraccion-retencion/{id}", status_code=status.HTTP_200_OK)
async def actualizar_fecha_pago_detraccion_retencion(id: int, payload: UpdateFechaPagoRetencionDetraccionSchema, db: AsyncSession = Depends(get_session)):
    try:
        query = (
            update(Venta)
            .where(Venta.id == id)
            # SQLAlchemy convertirá automáticamente el None de Python en un NULL de SQL
            .values(fecha_pago_detraccion_retencion=payload.fecha_pago_detraccion_retencion)
        )
        
        resultado = await db.execute(query)

        # Validamos primero si la venta existía antes de confirmar los cambios
        if resultado.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró la venta con ID {id}"
            )
            
        await db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException:
        # Volvemos a lanzar la excepción 404 para que no caiga en el bloque de SQLAlchemyError
        raise
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la columna: {str(e)}"
        )