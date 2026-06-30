
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
from app.api.v1.administracion.monitoreo.models.model_pro import ServicioPro
from app.api.v1.administracion.monitoreo.schemas.schema_pro import ProImportacion, ProCreate, CreateCliente, CreateUbicacion, ProOut, ProUpdate, ActualizarEstadoSchema, ProCalendarioVencimientosApiSchema

router_servicio_pro = APIRouter(prefix="/servicio-pro", tags=["Servicio Pro"], dependencies=[Depends(get_current_user)])

@router_servicio_pro.post("/importar", status_code=status.HTTP_201_CREATED)
async def importar_servicio_weather(file: UploadFile = File(...), db: AsyncSession = Depends(get_session)):
    try:
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(
            io.BytesIO(contents),
            dtype={"fact_relacionada": str}
        )
        
        # Reemplazamos todos los NaN/NaT por None de forma segura para Pydantic
        df = df.astype(object).where(pd.notnull(df), None)

        # Validar que las columnas necesarias estén presentes
        required_columns = ["nro_documento", "razon_social", "ubicacion", "fecha_inicio", "fecha_fin", "fact_relacionada", "estado"]
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Falta la columna requerida en el Excel: {col}"
                )

        registros_creados = 0

        # CACHÉ DE SESIÓN LOCAL: Guardará los IDs mapeados durante la ejecución de este bucle
        # Esto evita que si la fila 2 inserta 'SIN UBICACIÓN', la fila 3 intente insertarla de nuevo.
        cache_clientes = {}
        cache_ubicaciones = {}

        # Iterar sobre cada fila del DataFrame
        for index, row in df.iterrows():
            fila_actual = index + 2
            try:
                # 1. Convertir fechas y validar CLIENTE primero
                f_inicio = pd.to_datetime(row["fecha_inicio"]).date()
                f_fin = pd.to_datetime(row["fecha_fin"]).date()
                
                # .strip() elimina espacios en blanco accidentales que rompen la unicidad de las llaves
                nro_doc_clean = str(row["nro_documento"]).strip()
                razon_social_clean = str(row["razon_social"]).strip()
                ubicacion_clean = str(row["ubicacion"]).strip()

                cliente_data = CreateCliente(
                    nro_documento=nro_doc_clean,
                    razon_social=razon_social_clean
                )
                
                # Opcionales con manejo de vacíos
                estado_row = row.get("estado")
                estado_val = str(estado_row).strip() if estado_row and pd.notna(estado_row) else "PENDIENTE"
                
            except Exception as validation_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error de validación inicial en la fila {fila_actual}: {str(validation_err)}"
                )

            # 2. Validar/Crear el cliente en la BD para obtener su ID
            # Primero revisamos si ya lo procesamos en una fila anterior de este mismo Excel
            if cliente_data.nro_documento in cache_clientes:
                cliente_id = cache_clientes[cliente_data.nro_documento]
            else:
                # Si no está en caché, buscamos en la Base de Datos
                result_cliente = await db.execute(
                    select(GlobalCliente).where(GlobalCliente.nro_documento == cliente_data.nro_documento)
                )
                cliente = result_cliente.scalars().first()
                
                if not cliente:
                    cliente = GlobalCliente(
                        tipo_documento=cliente_data.tipo_documento,
                        nro_documento=cliente_data.nro_documento,
                        razon_social=cliente_data.razon_social
                    )
                    db.add(cliente)
                    await db.flush() # Sincroniza y genera el ID inmediatamente de forma segura

                cliente_id = cliente.id
                cache_clientes[cliente_data.nro_documento] = cliente_id # Guardamos en la caché local

            # 3. Validar y limpiar la ubicación con Pydantic
            try:
                ubicacion_data = CreateUbicacion(
                    ubicacion=ubicacion_clean
                )
                
                servicio_data = ProImportacion(
                    nro_documento=cliente_data.nro_documento,
                    razon_social=cliente_data.razon_social,
                    ubicacion=ubicacion_data.ubicacion,
                    fecha_inicio=f_inicio,
                    fecha_fin=f_fin,
                    fact_relacionada=row.get("fact_relacionada").strip() if pd.notna(row.get("fact_relacionada")) else None,
                    estado=estado_val,
                    adicional=str(row.get("adicional")).strip() if pd.notna(row.get("adicional")) else None
                )
            except Exception as validation_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error de validación de ubicación en la fila {fila_actual}: {str(validation_err)}"
                )

            # 4. Validar si la ubicación ya existe para obtener su ID (Solución al error 'SIN UBICACIÓN')
            # Primero revisamos nuestra caché local de este Excel
            if ubicacion_data.ubicacion in cache_ubicaciones:
                ubicacion_id = cache_ubicaciones[ubicacion_data.ubicacion]
            else:
                # Si no está en nuestra caché, vamos a la BD a verificar de verdad (Eliminamos tu consulta duplicada)
                result_ubicacion = await db.execute(
                    select(TablaUbicacionesMonitoreo).where(
                        TablaUbicacionesMonitoreo.ubicacion == ubicacion_data.ubicacion
                    )
                )
                ubicacion = result_ubicacion.scalars().first()

                if not ubicacion:
                    ubicacion = TablaUbicacionesMonitoreo(
                        ubicacion=ubicacion_data.ubicacion
                    )
                    db.add(ubicacion)
                    await db.flush() # Sincroniza la BD al instante para que la siguiente fila la reconozca

                ubicacion_id = ubicacion.id
                cache_ubicaciones[ubicacion_data.ubicacion] = ubicacion_id # Guardamos en la caché local

            # 5. Hacer el registro en la base de datos de ServicioPro
            nuevo_servicio = ServicioPro(
                cliente_id=cliente_id,
                ubicacion_id=ubicacion_id,
                fecha_inicio=servicio_data.fecha_inicio,
                fecha_fin=servicio_data.fecha_fin,
                fact_relacionada=servicio_data.fact_relacionada,
                estado=servicio_data.estado,
                adicional=servicio_data.adicional
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

@router_servicio_pro.get("/mostrar", response_model=List[ProOut], status_code=status.HTTP_200_OK)
async def mostrar_servicio_weather(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            ServicioPro.id,
            ServicioPro.cliente_id,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social,
            ServicioPro.ubicacion_id,
            TablaUbicacionesMonitoreo.ubicacion,
            ServicioPro.fecha_inicio,
            ServicioPro.fecha_fin,
            ServicioPro.estado,
            ServicioPro.fact_relacionada,
            ServicioPro.adicional
        )
        .select_from(ServicioPro)
        .join(GlobalCliente, ServicioPro.cliente_id == GlobalCliente.id)
        .join(TablaUbicacionesMonitoreo, ServicioPro.ubicacion_id == TablaUbicacionesMonitoreo.id)
        .order_by(ServicioPro.fecha_inicio.desc())
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router_servicio_pro.put("/actualizar/{id}", status_code=status.HTTP_200_OK)
async def actualizar_servicio_pro(id: int, update: ProUpdate, db: AsyncSession = Depends(get_session)):
    try:
        result = await db.execute(select(ServicioPro).where(ServicioPro.id == id))
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

@router_servicio_pro.delete("/eliminar-servicio-pro/{id}", status_code=status.HTTP_200_OK)
async def eliminar_servicio_pro(id: int, db: AsyncSession = Depends(get_session)):
    try: 
        result = await db.execute(select(ServicioPro).where(ServicioPro.id == id))
        servicio = result.scalar_one_or_none()

        if not servicio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontró el servicio con el ID {id}."
            )

        await db.delete(servicio)

        await db.commit()
        
        return {"status": "success", "message": f"Se eliminó con éxito el servicio con el ID {id}."}

    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno: {str(e)}"
        )

@router_servicio_pro.post("/registrar-servicio-pro", status_code=status.HTTP_201_CREATED)
async def registrar_servicio_pro(payload: ProCreate, db: AsyncSession = Depends(get_session)):
    try:
        nuevo_servicio = ServicioPro(
            cliente_id=payload.cliente_id,
            ubicacion_id=payload.ubicacion_id,
            fecha_inicio=payload.fecha_inicio,
            fecha_fin=payload.fecha_fin,
            fact_relacionada=payload.fact_relacionada,
            estado=payload.estado,
            adicional=payload.adicional
        )
        db.add(nuevo_servicio)
        await db.commit()
        return {"status": "success", "message": f"Se registro con éxito el servicio con el ID {nuevo_servicio.id}."}

    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno del servidor: {str(e)}"
        )

@router_servicio_pro.patch("/actualizar-pro-estado/{id}", status_code=status.HTTP_200_OK)
async def actualizar_servicio_pro_estado(
    id: int, 
    payload: ActualizarEstadoSchema,
    db: AsyncSession = Depends(get_session)
):
    try:
        # Buscar el servicio por ID
        result = await db.execute(select(ServicioPro).where(ServicioPro.id == id))
        servicio = result.scalar_one_or_none()

        if not servicio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró el servicio con el ID {id}"
            )

        # Actualizar explícitamente solo el campo 'estado'
        servicio.estado = payload.estado

        # Confirmar los cambios en la base de datos
        await db.commit()
        
        return {
            "status": "success", 
            "message": f"Se actualizó con éxito el estado del servicio con el ID {id}."
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

@router_servicio_pro.get("/calendario-vencimientos", response_model=List[ProCalendarioVencimientosApiSchema])
async def calendario_vencimientos(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            ServicioPro.fecha_fin
        )
        .select_from(ServicioPro)
        .where(ServicioPro.estado == "PENDIENTE")
        .order_by(ServicioPro.fecha_fin.asc())
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")