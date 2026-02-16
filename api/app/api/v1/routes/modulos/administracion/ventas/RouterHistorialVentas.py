import logging
from typing import List
import pandas as pd
import io
from fastapi import UploadFile, File

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import insert, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.deps import get_current_user
from app.api.v1.schemas.modulos.administracion.ventas.SchemaHistorialVentas import HistorialVentasCreate, HistorialVentasUpdate, HistorialVentasOut
from app.models.modulos.administracion.ventas.ModelHistorialVentas import HistorialVentas

logger = logging.getLogger("uvicorn.error")

router_historialVentas = APIRouter(
    prefix="/historialVentas",
    tags=["historialVentas"],
    dependencies=[Depends(get_current_user)],
)

@router_historialVentas.post("/import", status_code=status.HTTP_201_CREATED)
async def import_historialVentas(
    file: UploadFile = File(...), # Recibe el binario
    session: AsyncSession = Depends(get_session)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel")
    
    try:
        contents = await file.read()
        df = pd.read_excel(
            io.BytesIO(contents),
            dtype={'ruc': str, 'tipo': str, 'numero': int, 'serie': str, 'cliente': str}
            )
        df.columns = [c.lower().strip() for c in df.columns]

        # 1. Asegurar que las columnas existan y filtrar
        required = ["fecha", "descripcion", "categoria", "ruc", "cliente", "tipo", "serie", "numero", "subtotal", "igv", "total", "tc"]
        if not all(col in df.columns for col in required):
            raise HTTPException(status_code=400, detail="Columnas faltantes")

        # 2. Limpieza de datos críticos
        df = df[required].copy()
        
        # Convertir a tipos nativos de Python (evita errores de tipos de Numpy/Pandas)
        # Reemplazamos NaN por None para que SQLAlchemy los trate como NULL
        df = df.where(pd.notnull(df), None) 

        registros = df.to_dict(orient="records")

        # 3. Validación con el Schema de Pydantic (Opcional pero recomendado para seguridad extra)
        # Esto asegura que los Mixins de normalización de fecha se ejecuten
        try:
            validados = [HistorialVentasCreate(**r).model_dump() for r in registros]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error de validación en datos: {str(e)}")

        await session.execute(insert(HistorialVentas), validados)
        await session.commit()

        return {"status": "success", "inserted": len(validados)}
    
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router_historialVentas.get("", response_model=List[HistorialVentasOut])
async def listar_historialVentas(session: AsyncSession = Depends(get_session)):
    stmt = select(HistorialVentas).order_by(HistorialVentas.id)
    result = await session.execute(stmt)
    return result.scalars().all()