
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
from app.api.v1.administracion.monitoreo.models.model_MC import ServicioMC
from app.api.v1.administracion.monitoreo.schemas.schema_MC import MCImportacion, MCCreate, CreateCliente, CreateUbicacion, MCOut, MCUpdate, ActualizarEstadoSchema

router_servicio_mc = APIRouter(prefix="/servicio-mc", tags=["Servicio MC"], dependencies=[Depends(get_current_user)])

@router_servicio_mc.post("/importar", status_code=status.HTTP_201_CREATED)
async def importar_servicio_weather(file: UploadFile = File(...), db: AsyncSession = Depends(get_session)):
    try:
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(
            io.BytesIO(contents),
            dtype={"certificado": str, "informe": str}
        )
        
        # Reemplazamos todos los NaN/NaT por None de forma segura para Pydantic
        df = df.astype(object).where(pd.notnull(df), None)

        # Validar que las columnas necesarias estén presentes
        required_columns = ["nro_documento", "razon_social", "ubicacion", "fecha_inicio", "fecha_fin", "servicio", "informe", "certificado", "encargado", "tecnico", "estado", "incidencia"]
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
                servicio_clean = str(row["servicio"]).strip() if pd.notna(row["servicio"]) else None
                informe_clean = str(row["informe"]).strip() if pd.notna(row["informe"]) else None
                certificado_clean = str(row["certificado"]).strip() if pd.notna(row["certificado"]) else None
                encargado_clean = str(row["encargado"]).strip() if pd.notna(row["encargado"]) else None
                tecnico_clean = str(row["tecnico"]).strip() if pd.notna(row["tecnico"]) else None
                incidencia_clean = str(row["incidencia"]).strip() if pd.notna(row["incidencia"]) else None

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
                
                servicio_data = MCImportacion(
                    nro_documento=cliente_data.nro_documento,
                    razon_social=cliente_data.razon_social,
                    ubicacion=ubicacion_data.ubicacion,
                    fecha_inicio=f_inicio,
                    fecha_fin=f_fin,
                    servicio=servicio_clean,
                    informe=informe_clean,
                    certificado=certificado_clean,
                    encargado=encargado_clean,
                    tecnico=tecnico_clean,
                    estado=estado_val,
                    incidencia=incidencia_clean
                )
            except Exception as validation_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error de validación de ubicación en la fila {fila_actual}: {str(validation_err)}"
                )

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

            # 5. Hacer el registro en la base de datos de ServicioMC
            nuevo_servicio = ServicioMC(
                cliente_id=cliente_id,
                ubicacion_id=ubicacion_id,
                fecha_inicio=servicio_data.fecha_inicio,
                fecha_fin=servicio_data.fecha_fin,
                servicio=servicio_data.servicio,
                informe=servicio_data.informe,
                certificado=servicio_data.certificado,
                encargado=servicio_data.encargado,
                tecnico=servicio_data.tecnico,
                estado=servicio_data.estado,
                incidencia=servicio_data.incidencia

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

@router_servicio_mc.get("/mostrar", response_model=List[MCOut], status_code=status.HTTP_200_OK)
async def mostrar_servicio_weather(db: AsyncSession = Depends(get_session)):
    query = (
        select(
            ServicioMC.id,
            ServicioMC.cliente_id,
            GlobalCliente.nro_documento,
            GlobalCliente.razon_social,
            ServicioMC.ubicacion_id,
            TablaUbicacionesMonitoreo.ubicacion,
            ServicioMC.fecha_inicio,
            ServicioMC.fecha_fin,
            ServicioMC.estado,
            ServicioMC.fact_relacionada,
            ServicioMC.informe,
            ServicioMC.certificado,
            ServicioMC.encargado,
            ServicioMC.tecnico,
            ServicioMC.servicio,
            ServicioMC.incidencia
        )
        .select_from(ServicioMC)
        .join(GlobalCliente, ServicioMC.cliente_id == GlobalCliente.id)
        .join(TablaUbicacionesMonitoreo, ServicioMC.ubicacion_id == TablaUbicacionesMonitoreo.id)
        .order_by(ServicioMC.fecha_inicio.desc())
    )

    try:
        result = await db.execute(query)
        servicios = result.mappings().all()
        return servicios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router_servicio_mc.put("/actualizar/{id}", status_code=status.HTTP_200_OK)
async def actualizar_servicio_mc(id: int, update: MCUpdate, db: AsyncSession = Depends(get_session)):
    try:
        result = await db.execute(select(ServicioMC).where(ServicioMC.id == id))
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

@router_servicio_mc.delete("/eliminar-servicio-mc/{id}", status_code=status.HTTP_200_OK)
async def eliminar_servicio_mc(id: int, db: AsyncSession = Depends(get_session)):
    try: 
        result = await db.execute(select(ServicioMC).where(ServicioMC.id == id))
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

@router_servicio_mc.post("/registrar-servicio-mc", status_code=status.HTTP_201_CREATED)
async def registrar_servicio_mc(payload: MCCreate, db: AsyncSession = Depends(get_session)):
    try:
        nuevo_servicio = ServicioMC(
            cliente_id=payload.cliente_id,
            ubicacion_id=payload.ubicacion_id,
            fecha_inicio=payload.fecha_inicio,
            fecha_fin=payload.fecha_fin,
            fact_relacionada=payload.fact_relacionada,
            informe=payload.informe,
            certificado=payload.certificado,
            encargado=payload.encargado,
            tecnico=payload.tecnico,
            servicio=payload.servicio,
            incidencia=payload.incidencia,
            estado=payload.estado
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

@router_servicio_mc.patch("/actualizar-mc-estado/{id}", status_code=status.HTTP_200_OK)
async def actualizar_servicio_mc_estado(
    id: int, 
    payload: ActualizarEstadoSchema,
    db: AsyncSession = Depends(get_session)
):
    try:
        # Buscar el servicio por ID
        result = await db.execute(select(ServicioMC).where(ServicioMC.id == id))
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