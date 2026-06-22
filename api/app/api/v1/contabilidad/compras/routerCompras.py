from decimal import Decimal

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, desc, func, select, text
import pandas as pd
import io

# Importaciones de tus archivos
from app.api.v1.contabilidad.compras.modelCompras import Compra, CajaMovimientoCompra
from app.api.v1.administracion.globalClienteProveedor.modelGlobalProveedor import GlobalProveedor
from app.api.v1.contabilidad.compras.schemaCompras import CompraBase, SyncComrpasPayload, ResponseCompraLista, DeleteComprasPayload
from app.core.deps import get_current_user
from app.core.db import get_session

router_contabilidad_compras = APIRouter(
    prefix="/contabilidad/compras",
    tags=["contabilidad/compras"],
    dependencies=[Depends(get_current_user)]
)

@router_contabilidad_compras.post("/importar-ventas-excel", status_code=status.HTTP_201_CREATED)
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
            'base_imponible', 'igv', 'total'
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

        # 2. Sincronización de proveedors (OPTIMIZADO)
        # Obtenemos solo los proveedors únicos del Excel
        df_proveedors = df[['tipo_documento', 'nro_documento',
                        'razon_social']].drop_duplicates(subset=['nro_documento'])
        lista_nros = df_proveedors['nro_documento'].tolist()

        # Consultamos de un solo golpe qué proveedors YA existen en la DB
        stmt_existentes = select(GlobalProveedor).where(
            GlobalProveedor.nro_documento.in_(lista_nros))
        res_existentes = await db.execute(stmt_existentes)
        proveedors_db = {
            c.nro_documento: c for c in res_existentes.scalars().all()}

        # Identificamos cuáles faltan y los añadimos
        nuevo_proveedores_count = 0
        for _, row in df_proveedors.iterrows():
            nro = row['nro_documento']
            if nro not in proveedors_db:
                nuevo = GlobalProveedor(
                    tipo_documento=row['tipo_documento'],
                    nro_documento=nro,
                    razon_social=row['razon_social']
                )
                db.add(nuevo)
                # Lo añadimos al mapeo para el paso de ventas
                proveedors_db[nro] = nuevo
                nuevo_proveedores_count += 1

        # Flush para obtener IDs de nuevos proveedors
        if nuevo_proveedores_count > 0:
            await db.flush()

        # 3. Procesamiento de Ventas
        compras_para_insertar = []
        numeric_fields = ['base_imponible', 'igv', 'total', 'tipo_cambio', 'no_gravadas', 'otros']

        for index, row in df.iterrows():
            data = row.to_dict()

            # Normalización de strings y ceros a la izquierda
            for field in ['periodo', 'tipo_cp_codigo', 'serie', 'numero']:
                if data.get(field):
                    val = str(data[field]).replace('.0', '').strip()
                    data[field] = val.zfill(2) if field == 'tipo_cp_codigo' and len(val) == 1 else val

            # CORREGIDO: Conversión limpia de Float a Decimal para Pydantic
            for field in numeric_fields:
                val = data.get(field)
                if val is None or pd.isna(val):
                    data[field] = Decimal("1.000") if field == 'tipo_cambio' else Decimal("0.00")
                else:
                    data[field] = Decimal(str(val)) # Conversión segura a través de string

            try:
                venta_validada = CompraBase(**data)

                # Buscamos el ID del proveedor (mapeado en la sincronización previa)
                proveedor_obj = proveedors_db.get(data['nro_documento'])

                nueva_compra = Compra(
                    **venta_validada.model_dump(exclude={"id"}),
                    proveedor_id=proveedor_obj.id if proveedor_obj else None
                )
                compras_para_insertar.append(nueva_compra)
            except Exception as ve:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"Error en Fila {index + 2}: {str(ve)}")

        # 4. Inserción Masiva Final
        db.add_all(compras_para_insertar)
        await db.commit()

        return {
            "status": "success",
            "ventas_creadas": len(compras_para_insertar),
            "proveedors_nuevos_registrados": nuevo_proveedores_count
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error crítico en importación: {str(e)}")


@router_contabilidad_compras.get("/get-years", response_model=list[str])
async def get_years(db: AsyncSession = Depends(get_session)):
    query = (
        select(func.substring(Compra.periodo, 1, 4).label("anio"))
        .distinct()
        .order_by(desc(text("anio")))
    )

    result = await db.execute(query)
    return result.scalars().all()


@router_contabilidad_compras.post("/sync-compras", status_code=status.HTTP_201_CREATED)
async def sync_compras(payload: SyncComrpasPayload, db: AsyncSession = Depends(get_session)):
    all_compras = payload.created + payload.updates
    if not all_compras:
        return {"message": "Sin cambios"}

    try:
        # --- PASO 1: Sincronizar proveedors (Asegurar que existan) ---
        documentos = {
            v.nro_documento for v in all_compras if v.nro_documento}

        res_proveedors = await db.execute(
            select(GlobalProveedor).where(
                GlobalProveedor.nro_documento.in_(documentos))
        )
        mapeo_proveedores = {
            c.nro_documento: c for c in res_proveedors.scalars().all()}

        # Crear proveedors que no existen en el mapeo pero vienen en el payload
        for v in all_compras:
            if v.nro_documento and v.nro_documento not in mapeo_proveedores:
                # Solo creamos si tenemos los datos mínimos
                if v.razon_social and v.tipo_documento:
                    nuevo_cliente = GlobalProveedor(
                        tipo_documento=v.tipo_documento,
                        nro_documento=v.nro_documento,
                        razon_social=v.razon_social
                    )
                    db.add(nuevo_cliente)
                    mapeo_proveedores[v.nro_documento] = nuevo_cliente

        # Flush para obtener IDs de nuevos proveedors para las ventas
        await db.flush()

        # --- PASO 2: Crear Ventas ---
        for v in payload.created:
            data_venta = v.model_dump(
                exclude={"id", "nro_documento", "razon_social", "tipo_documento"})

            proveedor = mapeo_proveedores.get(v.nro_documento)
            nueva_venta = Compra(
                **data_venta,
                proveedor_id=proveedor.id if proveedor else v.proveedor_id
            )
            db.add(nueva_venta)

        # --- PASO 3: Actualizar Ventas ---
        for v in payload.updates:
            if not v.id:
                continue

            compra_db = await db.get(Compra, v.id)
            if compra_db:
                update_data = v.model_dump(
                    exclude={"id", "nro_documento", "razon_social", "tipo_documento"})
                for key, value in update_data.items():
                    setattr(compra_db, key, value)

                # Actualizar el proveedor_id si el nro_documento cambió o se resolvió
                proveedor = mapeo_proveedores.get(v.nro_documento)
                if proveedor:
                    compra_db.proveedor_id = proveedor.id

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

@router_contabilidad_compras.get("/lista", response_model=list[ResponseCompraLista])
async def get_lista_ventas(db: AsyncSession = Depends(get_session), periodo: str = None):
    query = select(
        Compra.id, Compra.periodo, Compra.fecha_emision, Compra.fecha_vencimiento, Compra.tipo_cp_codigo, Compra.serie, Compra.numero,
        GlobalProveedor.tipo_documento, GlobalProveedor.nro_documento, GlobalProveedor.razon_social,
        Compra.base_imponible, Compra.igv, Compra.no_gravadas, Compra.otros, Compra.total, Compra.moneda, Compra.tipo_cambio, Compra.descripcion_comprobante,Compra.link_pdf, Compra.is_active
    ).join(GlobalProveedor, Compra.proveedor_id == GlobalProveedor.id, isouter=True)

    if periodo:
        query = query.where(Compra.periodo == periodo)

    query = query.order_by(Compra.id.asc())

    result = await db.execute(query)
    return result.mappings().all()


@router_contabilidad_compras.delete("/delete", status_code=204)
async def delete_contabilidad_ventas(payload: DeleteComprasPayload, db: AsyncSession = Depends(get_session)):
    stmt_check = select(Compra.id).where(Compra.id.in_(payload.ids))
    result = await db.execute(stmt_check)
    existing_ids = result.scalars().all()

    if not existing_ids:
        raise HTTPException(
            status_code=404, detail="No se encontraron las ventas especificadas")

    stmt_delete = delete(Compra).where(Compra.id.in_(payload.ids))
    await db.execute(stmt_delete)

    await db.commit()
    return None
