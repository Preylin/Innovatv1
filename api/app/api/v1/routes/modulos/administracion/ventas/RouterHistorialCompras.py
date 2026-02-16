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
from app.api.v1.schemas.modulos.administracion.ventas.SchemaHistorialCompras import HistorialComprasCreate, HistorialComprasUpdate, HistorialComprasOut
from app.models.modulos.administracion.ventas.ModelHistorialCompras import HistorialCompras

logger = logging.getLogger("uvicorn.error")

router_historialCompras = APIRouter(
    prefix="/historialCompras",
    tags=["historialCompras"],
    dependencies=[Depends(get_current_user)],
)

@router_historialCompras.post("/import", status_code=status.HTTP_201_CREATED)
async def import_historialCompras(
    file: UploadFile = File(...), # Recibe el binario
    session: AsyncSession = Depends(get_session)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel")
    
    try:
        contents = await file.read()
        df = pd.read_excel(
            io.BytesIO(contents),
            dtype={'ruc': str, 'tipo': str, 'numero': int, 'serie': str, 'proveedor': str}
            )
        df.columns = [c.lower().strip() for c in df.columns]

        required = ["fecha", "descripcion", "ruc", "proveedor", "tipo", "serie", "numero", "subtotal", "igv", "nograbada", "otros", "total", "tc"]
        if not all(col in df.columns for col in required):
            raise HTTPException(status_code=400, detail="Columnas faltantes")

        df = df[required].copy()
        
        df = df.where(pd.notnull(df), None) 

        registros = df.to_dict(orient="records")

        try:
            validados = [HistorialComprasCreate(**r).model_dump() for r in registros]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error de validación en datos: {str(e)}")

        await session.execute(insert(HistorialCompras), validados)
        await session.commit()

        return {"status": "success", "inserted": len(validados)}
    
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router_historialCompras.get("", response_model=List[HistorialComprasOut])
async def listar_historialCompras(session: AsyncSession = Depends(get_session)):
    stmt = select(HistorialCompras).order_by(HistorialCompras.id)
    result = await session.execute(stmt)
    return result.scalars().all()