from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.deps import get_current_user
from app.core.db import get_session
from app.api.v1.tesoreria.schemas.SchemaTesoreriaCntPorPagar import (
    ObligacionCreate,
    ObligacionRead,
    ObligacionUpdate, 
    RegistroPagoCreate,
    ResponseCuentasPorPagarProveedoresLista,
    CuentasPorPagarProveedoresDetalleOnetoOneReadVentas,
    CuentasPorPagarProveedoresDetalleOnetoOneReadCajaVentas,
    RegistrarCobroProveedores,
    CuentasPorPagarEventualesCreate,
    CuentasPorPagarEventualesRead,
    CuentasPorPagarEventualesUpdate,
    CuentasPorPagarEventualesDetalleOnetoOneReadCajaVentas,
    RegistrarPagoEventuales
)
from app.api.v1.tesoreria.models.ModelsTesoreriaCntPorpagar import (
    ObligacionCuentasPorPagar, 
    RegistroCuentasPorPagar,
    ObligacionCuentasPorPagarEventuales,
    CajaMovimientoEventuales
)

from app.api.v1.contabilidad.compras.modelCompras import Compra, CajaMovimientoCompra
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalProveedor import GlobalProveedor



router_cuentasporpagar = APIRouter(
    prefix="/cuentasporpagar",
    tags=["cuentasporpagar"],
    dependencies=[Depends(get_current_user)],
)

@router_cuentasporpagar.get("/resumen-mensual", response_model=List[ObligacionRead])
async def get_resumen(mes: date, db: AsyncSession = Depends(get_session)):
    # Seleccionamos la obligación y la suma de sus pagos en ese mes
    stmt = (
        select(
            ObligacionCuentasPorPagar,
            func.sum(RegistroCuentasPorPagar.monto_pagado).label("total_pagado")
        )
        .outerjoin(
            RegistroCuentasPorPagar,
            (ObligacionCuentasPorPagar.id == RegistroCuentasPorPagar.obligacion_id) & 
            (RegistroCuentasPorPagar.mes_correspondiente == mes)
        )
        .where(ObligacionCuentasPorPagar.activo == True)
        .group_by(ObligacionCuentasPorPagar.id) # Agrupamos por la obligación
        .order_by(ObligacionCuentasPorPagar.dia_pago.asc())
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    response = []
    for ob, total_pagado in rows:
        data = ObligacionRead.from_orm(ob)
        # total_pagado será None si no hay registros por el outer join
        monto_acumulado = float(total_pagado) if total_pagado else 0.0
        data.monto_pagado_actual = monto_acumulado
        
        # Nueva lógica de estado basada en el acumulado
        if monto_acumulado <= 0:
            data.estado_pago = "PENDIENTE"
        elif monto_acumulado < float(ob.monto_esperado):
            data.estado_pago = "PARCIAL"
        else:
            data.estado_pago = "TOTAL"
            
        response.append(data)
    return response

@router_cuentasporpagar.post("/pagos")
async def crear_pago(pago: RegistroPagoCreate, db: AsyncSession = Depends(get_session)):
    # 1. Obtener la obligación para comparar montos
    stmt_ob = select(ObligacionCuentasPorPagar).where(ObligacionCuentasPorPagar.id == pago.obligacion_id)
    res_ob = await db.execute(stmt_ob)
    obligacion = res_ob.scalar_one_or_none()
    
    if not obligacion:
        raise HTTPException(status_code=404, detail="Obligación no encontrada")

    # 2. Buscar si YA existe un pago para esta obligación en este mes
    stmt_pago = select(RegistroCuentasPorPagar).where(
        (RegistroCuentasPorPagar.obligacion_id == pago.obligacion_id) &
        (RegistroCuentasPorPagar.mes_correspondiente == pago.mes_correspondiente)
    )
    res_pago = await db.execute(stmt_pago)
    pago_existente = res_pago.scalar_one_or_none()

    monto_final = pago.monto_pagado
    
    if pago_existente:
        monto_final = float(pago_existente.monto_pagado) + float(pago.monto_pagado)
        pago_existente.monto_pagado = monto_final
        pago_existente.estado_pago = "TOTAL" if monto_final >= obligacion.monto_esperado else "PARCIAL"
        
        # CORRECCIÓN AQUÍ: Cambiar fecha_pago por fecha_operacion
        pago_existente.fecha_operacion = datetime.now() 
        
        objeto_final = pago_existente
    else:
        estado = "TOTAL" if pago.monto_pagado >= obligacion.monto_esperado else "PARCIAL"
        
        # CORRECCIÓN AQUÍ: Asegúrate de que el diccionario no lleve "estado_pago" 
        # y asigna manualmente la fecha_operacion
        nuevo_data = pago.dict(exclude={"estado_pago"})
        
        nuevo_pago = RegistroCuentasPorPagar(
            **nuevo_data,
            estado_pago=estado,
            fecha_operacion=datetime.now() # Coincide con tu modelo de SQLAlchemy
        )
        db.add(nuevo_pago)
        objeto_final = nuevo_pago
    
    try:
        await db.commit()
        await db.refresh(objeto_final)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")
        
    return objeto_final

@router_cuentasporpagar.delete("/eliminar-obligacion/{id}")
async def desactivar_obligacion(id: int, db: AsyncSession = Depends(get_session)):
    """
    Realiza un borrado lógico de la obligación.
    """
    stmt = (
        update(ObligacionCuentasPorPagar)
        .where(ObligacionCuentasPorPagar.id == id)
        .values(activo=False)
    )
    
    result = await db.execute(stmt)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Obligación no encontrada")
        
    await db.commit()
    return {"status": "success", "message": "Obligación desactivada correctamente"}

@router_cuentasporpagar.post("/obligaciones", response_model=ObligacionRead)
async def crear_obligacion(
    obj_in: ObligacionCreate, 
    db: AsyncSession = Depends(get_session)
):
    """
    Registra una nueva obligación fija en el sistema de tesorería.
    """
    # 1. Instanciar el modelo de la base de datos con los datos de entrada
    nueva_obligacion = ObligacionCuentasPorPagar(
        **obj_in.dict()
    )
    
    # 2. Persistir en la base de datos
    try:
        db.add(nueva_obligacion)
        await db.commit()
        await db.refresh(nueva_obligacion)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Error interno al registrar la obligación"
        )
    
    return nueva_obligacion

@router_cuentasporpagar.put("/actualizar-obligacion/{id}", response_model=ObligacionRead)
async def actualizar_obligacion(
    id: int, 
    obj_in: ObligacionUpdate, 
    db: AsyncSession = Depends(get_session)
):
    """
    Actualiza una obligación existente en el sistema de tesorería.
    """
    # 1. Obtener la obligación existente
    stmt = select(ObligacionCuentasPorPagar).where(ObligacionCuentasPorPagar.id == id)
    result = await db.execute(stmt)
    obligacion_db = result.scalar_one_or_none()

    if not obligacion_db:
        raise HTTPException(
            status_code=404, 
            detail="La obligación solicitada no existe"
        )

    # 2. Extraer los datos enviados (excluyendo el ID para no intentar sobrescribirlo)
    update_data = obj_in.dict(exclude={"id"}, exclude_unset=True)

    # 3. Aplicar los cambios dinámicamente
    for field, value in update_data.items():
        setattr(obligacion_db, field, value)

    # 4. Persistir cambios
    try:
        await db.commit()
        await db.refresh(obligacion_db)
    except Exception as e:
        await db.rollback()
        print(f"Error al actualizar obligación: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno al actualizar los datos de la obligación"
        )

    # El response_model se encargará de transformar el modelo de DB al formato ObligacionRead
    return obligacion_db


# routers de cuentas por pagar proveedores
@router_cuentasporpagar.get("/resumen-proveedores", response_model=List[ResponseCuentasPorPagarProveedoresLista])
async def get_resumen(year: str, db: AsyncSession = Depends(get_session)):
    periodo_like = f"{year}%" 

    query = (
        select(
            Compra.id,
            Compra.fecha_emision,
            Compra.fecha_vencimiento,
            Compra.serie,
            Compra.numero,
            GlobalProveedor.nro_documento,
            GlobalProveedor.razon_social,
            Compra.total,
            Compra.moneda,
            Compra.tipo_cambio,
            func.coalesce(func.sum(CajaMovimientoCompra.monto_pagado), 0.00).label("monto_pagado"),
            Compra.link_pdf
        )
        .join(GlobalProveedor, Compra.proveedor_id == GlobalProveedor.id)
        .outerjoin(CajaMovimientoCompra, Compra.id == CajaMovimientoCompra.compra_id)
        .where(
            Compra.periodo.like(periodo_like),
            Compra.is_active == '1',
        )
        .group_by(
            Compra.id,
            GlobalProveedor.nro_documento,
            GlobalProveedor.razon_social
        )
        .order_by(Compra.fecha_emision.desc())
    )

    try:
        result = await db.execute(query)
        return result.mappings().all()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el resumen mensual: {str(e)}"
        )

@router_cuentasporpagar.get("/detalle-compras-proveedores/{id}", response_model=CuentasPorPagarProveedoresDetalleOnetoOneReadVentas)
async def get_detalle_cuenta(id: int, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            Compra.id,
            Compra.periodo,
            Compra.fecha_emision,
            Compra.fecha_vencimiento,
            Compra.serie,
            Compra.numero,
            Compra.base_imponible,
            Compra.igv,
            Compra.no_gravadas,
            Compra.otros,
            Compra.total,
            Compra.tipo_cambio,
            Compra.moneda,
            Compra.descripcion_comprobante,
        )
        .where(Compra.id == id)
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
    
@router_cuentasporpagar.get("/detalle-caja-compras-proveedores/{id}", response_model=List[CuentasPorPagarProveedoresDetalleOnetoOneReadCajaVentas])
async def get_detalle_cuenta(id: int, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            CajaMovimientoCompra.id,
            CajaMovimientoCompra.fecha_pago,
            CajaMovimientoCompra.lugar_salida,
            CajaMovimientoCompra.monto_pagado,
            CajaMovimientoCompra.medio_pago,
            CajaMovimientoCompra.glosa_pago,
        )
        .where(CajaMovimientoCompra.compra_id == id)
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

@router_cuentasporpagar.post("/registrar-pago-proveedores", status_code=status.HTTP_201_CREATED)
async def registrar_cobro(payload: RegistrarCobroProveedores, db: AsyncSession = Depends(get_session)):
    new_cobro = CajaMovimientoCompra(**payload.model_dump())

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

@router_cuentasporpagar.delete("/eliminar-pago-proveedores/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cobro(id: int, db: AsyncSession = Depends(get_session)):
    cobro = await db.get(CajaMovimientoCompra, id)
    
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

@router_cuentasporpagar.post("/registrar-pago-eventuales", status_code=status.HTTP_201_CREATED)
async def registrar_pago_eventuales(payload: CuentasPorPagarEventualesCreate, db: AsyncSession = Depends(get_session)):
    new_pago = ObligacionCuentasPorPagarEventuales(**payload.model_dump())

    try:
        db.add(new_pago)
        await db.commit()
        await db.refresh(new_pago)
        return new_pago

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el pago: {str(e)}"
        )
    
@router_cuentasporpagar.get("/resumen-eventuales", response_model=List[CuentasPorPagarEventualesRead])
async def get_resumen_eventuales(db: AsyncSession = Depends(get_session)):
    
    query = (
        select(
            ObligacionCuentasPorPagarEventuales.id,
            ObligacionCuentasPorPagarEventuales.fecha_emision,
            ObligacionCuentasPorPagarEventuales.fecha_vencimiento,
            ObligacionCuentasPorPagarEventuales.empresa,
            ObligacionCuentasPorPagarEventuales.detalle,
            ObligacionCuentasPorPagarEventuales.monto_esperado,
            ObligacionCuentasPorPagarEventuales.moneda,
            func.coalesce(func.sum(CajaMovimientoEventuales.monto_pagado), 0.00).label("monto_pagado")
        )
        .outerjoin(
            CajaMovimientoEventuales,
            (ObligacionCuentasPorPagarEventuales.id == CajaMovimientoEventuales.obligacion_id)
        )
        .where(ObligacionCuentasPorPagarEventuales.activo == True)
        .group_by(ObligacionCuentasPorPagarEventuales.id)
    )
    
    try:
        result = await db.execute(query)
        return result.mappings().all()
    
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el resumen: {str(e)}"
        )

@router_cuentasporpagar.get("/detalle-caja-eventuales/{id}", response_model=List[CuentasPorPagarEventualesDetalleOnetoOneReadCajaVentas])
async def get_detalle_caja_eventuales(id: int, db: AsyncSession = Depends(get_session)):
    query = (
        select(
            CajaMovimientoEventuales.id,
            CajaMovimientoEventuales.fecha_operacion,
            CajaMovimientoEventuales.lugar_salida,
            CajaMovimientoEventuales.monto_pagado,
            CajaMovimientoEventuales.medio_pago,
            CajaMovimientoEventuales.glosa_pago,
        )
        .where(CajaMovimientoEventuales.obligacion_id == id)
    )

    try:
        result = await db.execute(query)
        registro = result.mappings().all()
        return registro if registro else []
    

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al obtener el detalle: {str(e)}"
        )

@router_cuentasporpagar.post("/registrar-pago-unico-eventuales", status_code=status.HTTP_201_CREATED)
async def registrar_pago_eventuales(payload: RegistrarPagoEventuales, db: AsyncSession = Depends(get_session)):
    new_pago = CajaMovimientoEventuales(**payload.model_dump())

    try:
        db.add(new_pago)
        await db.commit()
        await db.refresh(new_pago)
        return new_pago

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el pago: {str(e)}"
        )

@router_cuentasporpagar.put("/actualizar-registro-eventuales/{id}")
async def actualizar_pago_eventuales(id: int, payload: CuentasPorPagarEventualesUpdate, db: AsyncSession = Depends(get_session)):
    stmt = select(ObligacionCuentasPorPagarEventuales).where(ObligacionCuentasPorPagarEventuales.id == id)
    result = await db.execute(stmt)
    obligacion_db = result.scalar_one_or_none()

    if not obligacion_db:
        raise HTTPException(
            status_code=404, 
            detail="La obligación solicitada no existe"
        )

    # 2. Actualizar los campos dinámicamente en el objeto rastreado por la sesión
    update_data = payload.model_dump(exclude_unset=True) # Evita pisar campos omitidos
    for key, value in update_data.items():
        setattr(obligacion_db, key, value)

    try:
        await db.commit()
        await db.refresh(obligacion_db)
    except Exception as e:
        await db.rollback()
        print(f"Error al actualizar obligación: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno al actualizar los datos de la obligación"
        )

    return obligacion_db

@router_cuentasporpagar.delete("/eliminar-pago-eventuales/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_pago_eventuales(id: int, db: AsyncSession = Depends(get_session)):
    pago = await db.get(CajaMovimientoEventuales, id)
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el pago con ID {id}"
        )

    try:
        await db.delete(pago)
        await db.commit()
        
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al eliminar el pago: {str(e)}"
        )

    return None

@router_cuentasporpagar.delete("/eliminar-obligacion-eventuales/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_obligacion_eventuales(id: int, db: AsyncSession = Depends(get_session)):
    stmt = (
        update(ObligacionCuentasPorPagarEventuales)
        .where(ObligacionCuentasPorPagarEventuales.id == id)
        .values(activo=False)
    )
    
    result = await db.execute(stmt)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la obligación con ID {id}"
        )

    try:
        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al eliminar la obligación: {str(e)}"
        )

    return None

#

#