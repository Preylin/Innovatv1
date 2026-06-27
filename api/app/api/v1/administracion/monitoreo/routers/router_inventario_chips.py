
from decimal import Decimal
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, desc, func, select, text
import pandas as pd
import io
from app.core.deps import get_current_user
from app.core.db import get_session

from app.api.v1.administracion.monitoreo.models.model_inventario_chips import InventarioChips
from app.api.v1.administracion.monitoreo.schemas.schema_inventario_chips import CreateIventarioChipsImportacion, IventarioChipsOut, CreateChipInventario,ChipInventarioUpdate, ChipDeleteSoft

router_servicio_inventario_chips = APIRouter(prefix="/servicio-inventario-chips", tags=["Servicio Inventario Chips"], dependencies=[Depends(get_current_user)])

@router_servicio_inventario_chips.post("/importar", status_code=status.HTTP_201_CREATED)
async def importar_servicio_weather(file: UploadFile = File(...), db: AsyncSession = Depends(get_session)):
    
    try:
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Reemplazamos todos los NaN/NaT por None de forma segura para Pydantic
        df = df.astype(object).where(pd.notnull(df), None)

        # Validar que las columnas necesarias estén presentes
        required_columns = ["numero_chip", "iccid", "operador", "plan", "fecha_activacion", "fecha_instalacion"]
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Falta la columna requerida en el Excel: {col}"
                )

        registros_creados = 0

        # Iterar sobre cada fila del DataFrame
        for index, row in df.iterrows():
            fila_actual = index + 2
            try:
                # 1. Convertir fechas y validar CLIENTE primero
                fecha_activacion = pd.to_datetime(row["fecha_activacion"]).date() if pd.notna(row["fecha_activacion"]) else None
                fecha_instalacion = pd.to_datetime(row["fecha_instalacion"]).date() if pd.notna(row["fecha_instalacion"]) else None

                numero_chip_clean = str(row["numero_chip"]).strip()
                iccid_clean = str(row["iccid"]).strip()
                operador_clean = str(row["operador"]).strip()
                plan_clean = str(row["plan"]).strip()
                
            except Exception as validation_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error de validación inicial en la fila {fila_actual}: {str(validation_err)}"
                )

            
            # 3. Validar y limpiar la ubicación con Pydantic
            try:
                
                servicio_data = CreateIventarioChipsImportacion(
                    numero_chip=numero_chip_clean,
                    iccid=iccid_clean,
                    operador=operador_clean,
                    plan=plan_clean,
                    fecha_activacion=fecha_activacion,
                    fecha_instalacion=fecha_instalacion
                )
            except Exception as validation_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error de validación de ubicación en la fila {fila_actual}: {str(validation_err)}"
                )


            # 5. Hacer el registro en la base de datos de ServicioPro
            nuevo_servicio = InventarioChips(
                numero_chip=servicio_data.numero_chip,
                iccid=servicio_data.iccid,
                operador=servicio_data.operador,
                plan=servicio_data.plan,
                fecha_activacion=servicio_data.fecha_activacion,
                fecha_instalacion=servicio_data.fecha_instalacion
            )
            db.add(nuevo_servicio)
            registros_creados += 1

        # Confirmar todos los cambios en la base de datos de un solo golpe al final
        await db.commit()
        return {"status": "success", "message": f"Se importaron con éxito {registros_creados} registros."}

    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router_servicio_inventario_chips.get("/mostrar", response_model=List[IventarioChipsOut], status_code=status.HTTP_200_OK)
async def mostrar_servicio_weather(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            InventarioChips.id,
            InventarioChips.numero_chip,
            InventarioChips.iccid,
            InventarioChips.operador,
            InventarioChips.plan,
            InventarioChips.fecha_activacion,
            InventarioChips.fecha_instalacion,
            InventarioChips.adicional
        )
        .select_from(InventarioChips)
        .order_by(InventarioChips.fecha_registro.desc())
        .where(InventarioChips.is_active == True)
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router_servicio_inventario_chips.put("/actualizar/{id}", status_code=status.HTTP_200_OK)
async def actualizar_servicio_inventario_chips(id: int, update: ChipInventarioUpdate, db: AsyncSession = Depends(get_session)):
    try:
        result = await db.execute(select(InventarioChips).where(InventarioChips.id == id))
        servicio = result.scalar_one_or_none()

        if not servicio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró el servicio con el ID {id}"
            )

        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(servicio, key, value)

        await db.commit()
        
        return {
            "status": "success", 
            "message": f"Se actualizó con éxito el servicio con el ID {id}."
        }

    except HTTPException:
        # Si es un 404 u otro HTTP error controlado, no es estrictamente necesario el rollback, 
        # pero lo dejamos si hay riesgo de estados corruptos previos.
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno del servidor al actualizar: {str(e)}"
        )

@router_servicio_inventario_chips.patch("/eliminar-servicio-inventario-chips-soft/{id}", status_code=status.HTTP_200_OK)
async def eliminar_servicio_inventario_chips_soft(
    id: int, 
    delete: ChipDeleteSoft, 
    db: AsyncSession = Depends(get_session)
):
    try: 
        result = await db.execute(select(InventarioChips).where(InventarioChips.id == id))
        servicio = result.scalar_one_or_none()

        if not servicio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontró el servicio con el ID {id}."
            )

        servicio.is_active = delete.is_active

        await db.commit()
        
        return {
            "status": "success", 
            "message": f"Se actualizó el estado lógico del servicio con el ID {id}."
        }

    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno: {str(e)}"
        )
# registrar nuevo chip y devolver error si ya existe numero_chip
@router_servicio_inventario_chips.post ("/registrar-servicio-inventario-chips", status_code=status.HTTP_201_CREATED)
async def registrar_servicio_inventario_chips(payload: CreateChipInventario, db: AsyncSession = Depends(get_session)):
    # 1. Validar que no exista el chip
    chip_existe = await db.execute(select(InventarioChips).where(InventarioChips.numero_chip == payload.numero_chip))
    if chip_existe.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={
                "loc": ["body", "numero_chip"],
                "msg": "El chip ya existe",
                "type": "validation"
            }
        )
    
    nuevo_servicio = InventarioChips(
        numero_chip=payload.numero_chip,
        iccid=payload.iccid,
        operador=payload.operador,
        plan=payload.plan,
        fecha_activacion=payload.fecha_activacion,
        fecha_instalacion=payload.fecha_instalacion,
        adicional=payload.adicional
    )
    db.add(nuevo_servicio)
    await db.commit()    
    return {"status": "success", "message": f"Se registro con éxito el servicio con el ID {nuevo_servicio.id}."}

