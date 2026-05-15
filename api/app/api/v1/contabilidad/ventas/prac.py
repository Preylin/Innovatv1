    


# @router_contabilidad_ventas.post("/importar-ventas-excel", status_code=201)
# async def importar_ventas_excel(
#     file: UploadFile = File(...), 
#     db: AsyncSession = Depends(get_session)
# ):
#     if not file.filename.endswith(('.xlsx', '.xls')):
#         raise HTTPException(status_code=400, detail="Formato de archivo no soportado.")

#     try:
#         contents = await file.read()
#         df = pd.read_excel(io.BytesIO(contents))
        
#         # 1. Normalización total de columnas
#         df.columns = [c.lower().strip() for c in df.columns]

#         # 2. Definir columnas mínimas requeridas para que el proceso no rompa
#         required_cols = [
#             'periodo', 'fecha_emision', 'tipo_cp_codigo', 'serie', 'numero',
#             'nro_documento', 'razon_social', 'tipo_documento',
#             'base_imponible', 'igv', 'total'
#         ]
        
#         missing = [col for col in required_cols if col not in df.columns]
#         if missing:
#             # Aquí el error será explícito: "Faltan: base_imponible, igv..."
#             raise HTTPException(status_code=400, detail=f"Columnas faltantes: {', '.join(missing)}")

#         # 3. Limpieza de datos crítica para Perú (RUCs/DNI)
#         df = df.replace({pd.NA: None, float('nan'): None})
#         df['nro_documento'] = df['nro_documento'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
#         df['tipo_documento'] = df['tipo_documento'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()

#         # 4. Sincronización de Clientes
#         clientes_unicos = df[['tipo_documento', 'nro_documento', 'razon_social']].drop_duplicates(subset=['nro_documento'])
        
#         for _, row in clientes_unicos.iterrows():
#             stmt = select(ClienteVentas).where(ClienteVentas.nro_documento == row['nro_documento'])
#             result = await db.execute(stmt)
#             obj = result.scalar_one_or_none()
#             if not obj:
#                 db.add(ClienteVentas(
#                     tipo_documento=row['tipo_documento'],
#                     nro_documento=row['nro_documento'],
#                     razon_social=row['razon_social']
#                 ))
#         await db.flush()

#         # 5. Mapeo de IDs y Validación
#         res_c = await db.execute(select(ClienteVentas.nro_documento, ClienteVentas.id))
#         mapeo_id = {str(r[0]): r[1] for r in res_c.all()}

#         ventas_para_insertar = []
#         for index, row in df.iterrows():
#             data = row.to_dict()
            
#             # 1. Normalizar Campos de Texto (Lo que ya tenías)
#             text_fields = ['periodo', 'tipo_cp_codigo', 'serie', 'numero', 'tipo_documento', 'nro_documento']
#             for field in text_fields:
#                 if field in data and data[field] is not None:
#                     data[field] = str(data[field]).replace('.0', '').strip()
#                     if field == 'tipo_cp_codigo' and len(data[field]) == 1:
#                         data[field] = data[field].zfill(2)
            
#             # 2. NUEVO: Normalizar Campos Numéricos (Evitar el error de Decimal None)
#             # Definimos los campos que NO pueden ser None para Pydantic
#             numeric_fields = ['base_imponible', 'igv', 'total', 'monto_retencion', 'monto_detraccion', 'tipo_cambio']
#             for field in numeric_fields:
#                 # Si el campo no existe o es None/NaN, le ponemos 0 o su valor por defecto
#                 if field not in data or pd.isna(data[field]) or data[field] is None:
#                     if field == 'tipo_cambio':
#                         data[field] = 1.000
#                     else:
#                         data[field] = 0.00
            
#             try:
#                 # Ahora VentaBase recibirá 0.00 en lugar de None para el IGV
#                 venta_validada = VentaBase(**data)
                
#                 nueva_venta = Venta(
#                     **venta_validada.model_dump(),
#                     cliente_id=mapeo_id.get(str(data['nro_documento'])) # Usamos data normalizada
#                 )
#                 ventas_para_insertar.append(nueva_venta)
#             except Exception as ve:
#                 # Esto te ayudará a debuggear mejor si sale otro error
#                 raise HTTPException(status_code=422, detail=f"Fila {index + 2}: {str(ve)}")

#         db.add_all(ventas_para_insertar)
#         await db.commit()

#         return {"status": "success", "registros_procesados": len(ventas_para_insertar)}

#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         await db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
