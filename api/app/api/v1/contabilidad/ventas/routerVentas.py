from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, desc, func, select, text
import pandas as pd
import io

# Importaciones de tus archivos
from app.api.v1.contabilidad.ventas.modelVentas import Venta
from app.api.v1.administracion.globalClienteProveedor.models.modelGlobalCliente import GlobalCliente
from app.api.v1.contabilidad.ventas.schemaVentas import VentaBase, ResponseVentaLista, DeleteVentasPayload, SyncVentasPayload
from app.core.deps import get_current_user
from app.core.db import get_session

router_contabilidad_ventas = APIRouter(
    prefix="/contabilidad/ventas",
    tags=["contabilidad/ventas"],
    dependencies=[Depends(get_current_user)]
)


@router_contabilidad_ventas.post("/sync-ventas", status_code=status.HTTP_201_CREATED)
async def sync_ventas(payload: SyncVentasPayload, db: AsyncSession = Depends(get_session)):
    todas_las_ventas = payload.created + payload.updates
    if not todas_las_ventas:
        return {"message": "Sin cambios"}

    try:
        # --- PASO 1: Sincronizar Clientes (Asegurar que existan) ---
        documentos = {
            v.nro_documento for v in todas_las_ventas if v.nro_documento}

        res_clientes = await db.execute(
            select(GlobalCliente).where(
                GlobalCliente.nro_documento.in_(documentos))
        )
        mapeo_clientes = {
            c.nro_documento: c for c in res_clientes.scalars().all()}

        # Crear clientes que no existen en el mapeo pero vienen en el payload
        for v in todas_las_ventas:
            if v.nro_documento and v.nro_documento not in mapeo_clientes:
                # Solo creamos si tenemos los datos mínimos
                if v.razon_social and v.tipo_documento:
                    nuevo_cliente = GlobalCliente(
                        tipo_documento=v.tipo_documento,
                        nro_documento=v.nro_documento,
                        razon_social=v.razon_social
                    )
                    db.add(nuevo_cliente)
                    mapeo_clientes[v.nro_documento] = nuevo_cliente

        # Flush para obtener IDs de nuevos clientes para las ventas
        await db.flush()

        # --- PASO 2: Crear Ventas ---
        for v in payload.created:
            data_venta = v.model_dump(
                exclude={"id", "nro_documento", "razon_social", "tipo_documento"})

            cliente = mapeo_clientes.get(v.nro_documento)
            nueva_venta = Venta(
                **data_venta,
                cliente_id=cliente.id if cliente else v.cliente_id
            )
            db.add(nueva_venta)

        # --- PASO 3: Actualizar Ventas ---
        for v in payload.updates:
            if not v.id:
                continue

            venta_db = await db.get(Venta, v.id)
            if venta_db:
                update_data = v.model_dump(
                    exclude={"id", "nro_documento", "razon_social", "tipo_documento"})
                for key, value in update_data.items():
                    setattr(venta_db, key, value)

                # Actualizar el cliente_id si el nro_documento cambió o se resolvió
                cliente = mapeo_clientes.get(v.nro_documento)
                if cliente:
                    venta_db.cliente_id = cliente.id

        await db.commit()
        return {
            "status": "success",
            "procesados": {
                "creados": len(payload.created),
                "actualizados": len(payload.updates)
            }
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error en sincronización masiva: {str(e)}")


@router_contabilidad_ventas.post("/importar-ventas-excel", status_code=status.HTTP_201_CREATED)
async def importar_ventas_excel(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, detail="Formato de archivo no soportado.")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        # 1. Normalización y Limpieza inicial
        df.columns = [c.lower().strip() for c in df.columns]

        required_cols = [
            'periodo', 'fecha_emision', 'tipo_cp_codigo', 'serie', 'numero',
            'nro_documento', 'razon_social', 'tipo_documento',
            'base_imponible', 'igv', 'total', 'categoria'
        ]

        df['descripcion_comprobante'] = (df['descripcion_comprobante']
                    .astype(str)
                    .str.replace(r'\n|\r', ' ', regex=True)
                    .str.replace(r'\s+', ' ', regex=True)
                    .str.strip()
                    .str.upper())

        df['descripcion_comprobante'] = df['descripcion_comprobante'].replace(["NAN", "NONE", "NAT"], None)

        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail = [
                    {
                        "loc": ["body"],
                        "msg": f"Columnas faltantes: {', '.join(missing)}, se recomienda al usuario revisar correctamente el archivo",
                        "type": "value_error"
                    }
                ]
            )

        # Limpieza masiva de NaN y formatos de string
        df = df.replace({pd.NA: None, float('nan'): None})

        # conversion de tipos
        df['is_active'] = pd.to_numeric(df['is_active'], errors='coerce').fillna(0).astype(int).astype(str)

        # Vectorización: Limpieza de documentos sin loops
        for col in ['nro_documento', 'tipo_documento']:
            df[col] = df[col].astype(str).str.replace(
                r'\.0$', '', regex=True).str.strip()

        # 2. Sincronización de Clientes (OPTIMIZADO)
        # Obtenemos solo los clientes únicos del Excel
        df_clientes = df[['tipo_documento', 'nro_documento',
                        'razon_social']].drop_duplicates(subset=['nro_documento'])
        lista_nros = df_clientes['nro_documento'].tolist()

        # Consultamos de un solo golpe qué clientes YA existen en la DB
        stmt_existentes = select(GlobalCliente).where(
            GlobalCliente.nro_documento.in_(lista_nros))
        res_existentes = await db.execute(stmt_existentes)
        clientes_db = {
            c.nro_documento: c for c in res_existentes.scalars().all()}

        # Identificamos cuáles faltan y los añadimos
        nuevos_clientes_count = 0
        for _, row in df_clientes.iterrows():
            nro = row['nro_documento']
            if nro not in clientes_db:
                nuevo = GlobalCliente(
                    tipo_documento=row['tipo_documento'],
                    nro_documento=nro,
                    razon_social=row['razon_social']
                )
                db.add(nuevo)
                # Lo añadimos al mapeo para el paso de ventas
                clientes_db[nro] = nuevo
                nuevos_clientes_count += 1

        # Flush para obtener IDs de nuevos clientes
        if nuevos_clientes_count > 0:
            await db.flush()

        # 3. Procesamiento de Ventas
        ventas_para_insertar = []
        numeric_fields = ['base_imponible', 'igv', 'total',
                        'monto_retencion', 'monto_detraccion', 'tipo_cambio']

        for index, row in df.iterrows():
            data = row.to_dict()

            # Normalización de strings y ceros a la izquierda
            for field in ['periodo', 'tipo_cp_codigo', 'serie', 'numero']:
                if data.get(field):
                    val = str(data[field]).replace('.0', '').strip()
                    data[field] = val.zfill(
                        2) if field == 'tipo_cp_codigo' and len(val) == 1 else val

            # Normalización numérica (Vectorizable, pero aquí se hace por fila para validación de Pydantic)
            for field in numeric_fields:
                val = data.get(field)
                if val is None or pd.isna(val):
                    data[field] = 1.0 if field == 'tipo_cambio' else 0.0
                else:
                    data[field] = float(val)

            try:
                venta_validada = VentaBase(**data)

                # Buscamos el ID del cliente en nuestro mapeo local optimizado
                cliente_obj = clientes_db.get(data['nro_documento'])

                nueva_venta = Venta(
                    **venta_validada.model_dump(exclude={"id"}),
                    cliente_id=cliente_obj.id if cliente_obj else None
                )
                ventas_para_insertar.append(nueva_venta)
            except Exception as ve:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"Error en Fila {index + 2}: {str(ve)}")

        # 4. Inserción Masiva Final
        db.add_all(ventas_para_insertar)
        await db.commit()

        return {
            "status": "success",
            "ventas_creadas": len(ventas_para_insertar),
            "clientes_nuevos_registrados": nuevos_clientes_count
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error crítico en importación: {str(e)}")


@router_contabilidad_ventas.get("/get-years", response_model=list[str])
async def get_years(db: AsyncSession = Depends(get_session)):
    query = (
        select(func.substring(Venta.periodo, 1, 4).label("anio"))
        .distinct()
        .order_by(desc(text("anio")))
    )

    result = await db.execute(query)
    return result.scalars().all()


@router_contabilidad_ventas.get("/lista", response_model=list[ResponseVentaLista])
async def get_lista_ventas(db: AsyncSession = Depends(get_session), periodo: str = None):
    query = select(
        Venta.id, Venta.periodo, Venta.fecha_emision, Venta.fecha_vencimiento, Venta.tipo_cp_codigo, Venta.serie, Venta.numero,
        GlobalCliente.tipo_documento, GlobalCliente.nro_documento, GlobalCliente.razon_social,
        Venta.base_imponible, Venta.igv, Venta.total, Venta.moneda, Venta.tipo_cambio, Venta.categoria, Venta.descripcion_comprobante,Venta.monto_retencion, Venta.monto_detraccion, Venta.link_pdf, Venta.is_active
    ).join(GlobalCliente, Venta.cliente_id == GlobalCliente.id, isouter=True)

    if periodo:
        query = query.where(Venta.periodo == periodo)

    query = query.order_by(Venta.id.asc())

    result = await db.execute(query)
    return result.mappings().all()


@router_contabilidad_ventas.delete("/delete", status_code=204)
async def delete_contabilidad_ventas(payload: DeleteVentasPayload, db: AsyncSession = Depends(get_session)):
    stmt_check = select(Venta.id).where(Venta.id.in_(payload.ids))
    result = await db.execute(stmt_check)
    existing_ids = result.scalars().all()

    if not existing_ids:
        raise HTTPException(
            status_code=404, detail="No se encontraron las ventas especificadas")

    stmt_delete = delete(Venta).where(Venta.id.in_(payload.ids))
    await db.execute(stmt_delete)

    await db.commit()
    return None
