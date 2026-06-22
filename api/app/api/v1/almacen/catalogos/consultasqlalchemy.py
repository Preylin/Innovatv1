from sqlalchemy import text
from app.core.db import get_session

async def obtenerstock():
    async for db in get_session(): 
        query = text("SELECT * FROM almacen.v_stock_actual_mercaderia;")
        result = await db.execute(query)
        return result.mappings().all()
