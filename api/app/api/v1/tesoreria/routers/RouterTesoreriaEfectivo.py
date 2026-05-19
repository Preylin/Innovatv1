
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession


from app.core.deps import get_current_user
from app.core.db import get_session
from app.api.v1.tesoreria.schemas.SchemaTesoreriaEfectivo import DeleteRequest, EfectivoOut, SaldosIndependientes, SyncPayload, SyncResponse, ListasUnicasResponse
from app.api.v1.tesoreria.models.ModelsTesoreriaEfectivo import CajaChica, Bcpsoles, Bcpdolares

# router caja chica
router_cajachica = APIRouter(
    prefix="/cajachica",
    tags=["cajachica"],
    dependencies=[Depends(get_current_user)],
)

@router_cajachica.get("", response_model=list[EfectivoOut])
async def get_caja_chica(session: AsyncSession = Depends(get_session)):
    stmt = select(CajaChica).order_by(CajaChica.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router_cajachica.post("", response_model=SyncResponse)
async def sync_caja_chica(
    payload: SyncPayload, 
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Procesar Actualizaciones de forma eficiente
        if payload.updates:
            # Obtenemos todos los IDs de una sola vez
            update_ids = [item.id for item in payload.updates]
            stmt = select(CajaChica).where(CajaChica.id.in_(update_ids))
            result = await session.execute(stmt)
            db_items = {item.id: item for item in result.scalars().all()}

            for item_update in payload.updates:
                db_item = db_items.get(item_update.id)
                if db_item:
                    # Excluimos campos que no deben actualizarse manualmente si fuera el caso
                    update_data = item_update.model_dump(exclude_unset=True)
                    for key, value in update_data.items():
                        setattr(db_item, key, value)
                    # Forzamos actualización de timestamp si no lo hace el server_default
                    db_item.updated_at = datetime.now()

        # 2. Procesar Creaciones
        if payload.created:
            # Convertimos esquemas a modelos de SQLAlchemy
            new_rows = [
                CajaChica(**item.model_dump()) 
                for item in payload.created
            ]
            session.add_all(new_rows)

        await session.commit()
        
        return {
            "success": True, 
            "message": f"Sincronización exitosa: {len(payload.updates)} actualizados, {len(payload.created)} creados."
        }

    except Exception as e:
        await session.rollback()
        # Loggear el error aquí sería ideal
        raise HTTPException(status_code=500, detail="Error interno al sincronizar caja chica")


@router_cajachica.delete("/batch-delete")
async def delete_multiple_caja_chica(
    payload: DeleteRequest, 
    session: AsyncSession = Depends(get_session)
):
    try:
        stmt = delete(CajaChica).where(CajaChica.id.in_(payload.ids))
        result = await session.execute(stmt)
        affected_rows = result.rowcount
        
        if affected_rows == 0:
            raise HTTPException(status_code=404, detail="No se encontraron registros")
            
        await session.commit()
        return {"success": True, "message": f"Eliminados {affected_rows} registros"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router_cajachica.get("/saldos_independientes", response_model=SaldosIndependientes)
async def obtener_saldos_separados(session: AsyncSession = Depends(get_session)):
    query = text("SELECT * FROM tesoreria.v_saldos_independientes;")
    result = await session.execute(query)
    row = result.mappings().first()
    
    # Si por alguna razón la vista no devuelve nada (muy raro), enviamos ceros
    if not row:
        return {
            "saldo_caja_chica": 0.0, 
            "saldo_bcp_soles": 0.0, 
            "saldo_bcp_dolares": 0.0
        }
        
    return row


# router bcpsoles

router_bcpsoles = APIRouter(
    prefix="/bcpsoles",
    tags=["bcpsoles"],
    dependencies=[Depends(get_current_user)],
)

@router_bcpsoles.get("", response_model=list[EfectivoOut])
async def get_bcpsoles(session: AsyncSession = Depends(get_session)):
    stmt = select(Bcpsoles).order_by(Bcpsoles.id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router_bcpsoles.post("", response_model=SyncResponse)
async def sync_bcp_soles(
    payload: SyncPayload, 
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Procesar Actualizaciones de forma eficiente
        if payload.updates:
            # Obtenemos todos los IDs de una sola vez
            update_ids = [item.id for item in payload.updates]
            stmt = select(Bcpsoles).where(Bcpsoles.id.in_(update_ids))
            result = await session.execute(stmt)
            db_items = {item.id: item for item in result.scalars().all()}

            for item_update in payload.updates:
                db_item = db_items.get(item_update.id)
                if db_item:
                    # Excluimos campos que no deben actualizarse manualmente si fuera el caso
                    update_data = item_update.model_dump(exclude_unset=True)
                    for key, value in update_data.items():
                        setattr(db_item, key, value)
                    # Forzamos actualización de timestamp si no lo hace el server_default
                    db_item.updated_at = datetime.now()

        # 2. Procesar Creaciones
        if payload.created:
            # Convertimos esquemas a modelos de SQLAlchemy
            new_rows = [
                Bcpsoles(**item.model_dump()) 
                for item in payload.created
            ]
            session.add_all(new_rows)

        await session.commit()
        
        return {
            "success": True, 
            "message": f"Sincronización exitosa: {len(payload.updates)} actualizados, {len(payload.created)} creados."
        }

    except Exception as e:
        await session.rollback()
        # Loggear el error aquí sería ideal
        raise HTTPException(status_code=500, detail="Error interno al sincronizar bcp soles")

@router_bcpsoles.delete("/batch-delete")
async def delete_bcp_soles(
    payload: DeleteRequest, 
    session: AsyncSession = Depends(get_session)
):
    try:
        stmt = delete(Bcpsoles).where(Bcpsoles.id.in_(payload.ids))
        result = await session.execute(stmt)
        affected_rows = result.rowcount
        
        if affected_rows == 0:
            raise HTTPException(status_code=404, detail="No se encontraron registros")
            
        await session.commit()
        return {"success": True, "message": f"Eliminados {affected_rows} registros"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router_bcpsoles.get("/resumen_columnas", response_model=ListasUnicasResponse)
async def get_datos_resumen_bcpsoles(db: AsyncSession = Depends(get_session)):
    desc_cte = (
        select(
            Bcpsoles.descripcion,
            func.row_number().over(order_by=Bcpsoles.descripcion).label('rn')
        )
        .where(Bcpsoles.descripcion.is_not(None))
        .group_by(Bcpsoles.descripcion)
        .cte('descripciones_unicas')
    )

    ref_cte = (
        select(
            Bcpsoles.referencia,
            func.row_number().over(order_by=Bcpsoles.referencia).label('rn')
        )
        .where(Bcpsoles.referencia.is_not(None))
        .group_by(Bcpsoles.referencia)
        .cte('referencias_unicas')
    )

    adi_cte = (
        select(
            Bcpsoles.adicionales,
            func.row_number().over(order_by=Bcpsoles.adicionales).label('rn')
        )
        .where(Bcpsoles.adicionales.is_not(None))
        .group_by(Bcpsoles.adicionales)
        .cte('adicionales_unicas')
    )

    stmt = (
        select(
            desc_cte.c.descripcion,
            ref_cte.c.referencia,
            adi_cte.c.adicionales
        )
        .select_from(desc_cte)
        .join(ref_cte, desc_cte.c.rn == ref_cte.c.rn, full=True)
        .join(adi_cte, func.coalesce(desc_cte.c.rn, ref_cte.c.rn) == adi_cte.c.rn, full=True)
    )

    result = await db.execute(stmt)
    # Obtenemos todas las filas planas de la base de datos
    rows = result.all()

    # Procesamos y agrupamos los datos ignorando los valores nulos (None)
    return {
        "descripciones": [row.descripcion for row in rows if row.descripcion is not None],
        "referencias": [row.referencia for row in rows if row.referencia is not None],
        "adicionales": [row.adicionales for row in rows if row.adicionales is not None]
    }


# router bcpdolares

router_bcpdolares = APIRouter(
    prefix="/bcpdolares",
    tags=["bcpdolares"],
    dependencies=[Depends(get_current_user)],
)

@router_bcpdolares.get("", response_model=list[EfectivoOut])
async def get_bcpdolares(session: AsyncSession = Depends(get_session)):
    stmt = select(Bcpdolares).order_by(Bcpdolares.id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router_bcpdolares.post("", response_model=SyncResponse)
async def sync_bcp_dolares(
    payload: SyncPayload, 
    session: AsyncSession = Depends(get_session)
):
    try:
        # 1. Procesar Actualizaciones de forma eficiente
        if payload.updates:
            # Obtenemos todos los IDs de una sola vez
            update_ids = [item.id for item in payload.updates]
            stmt = select(Bcpdolares).where(Bcpdolares.id.in_(update_ids))
            result = await session.execute(stmt)
            db_items = {item.id: item for item in result.scalars().all()}

            for item_update in payload.updates:
                db_item = db_items.get(item_update.id)
                if db_item:
                    # Excluimos campos que no deben actualizarse manualmente si fuera el caso
                    update_data = item_update.model_dump(exclude_unset=True)
                    for key, value in update_data.items():
                        setattr(db_item, key, value)
                    # Forzamos actualización de timestamp si no lo hace el server_default
                    db_item.updated_at = datetime.now()

        # 2. Procesar Creaciones
        if payload.created:
            # Convertimos esquemas a modelos de SQLAlchemy
            new_rows = [
                Bcpdolares(**item.model_dump()) 
                for item in payload.created
            ]
            session.add_all(new_rows)

        await session.commit()
        
        return {
            "success": True, 
            "message": f"Sincronización exitosa: {len(payload.updates)} actualizados, {len(payload.created)} creados."
        }

    except Exception as e:
        await session.rollback()
        # Loggear el error aquí sería ideal
        raise HTTPException(status_code=500, detail="Error interno al sincronizar bcp dolares")

@router_bcpdolares.delete("/batch-delete")
async def delete_bcp_dolares(
    payload: DeleteRequest, 
    session: AsyncSession = Depends(get_session)
):
    try:
        stmt = delete(Bcpdolares).where(Bcpdolares.id.in_(payload.ids))
        result = await session.execute(stmt)
        affected_rows = result.rowcount
        
        if affected_rows == 0:
            raise HTTPException(status_code=404, detail="No se encontraron registros")
            
        await session.commit()
        return {"success": True, "message": f"Eliminados {affected_rows} registros"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))