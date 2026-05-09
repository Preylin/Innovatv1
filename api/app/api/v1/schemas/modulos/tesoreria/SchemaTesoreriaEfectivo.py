from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class EfectivoBase(BaseModel):
    # Pydantic parsea automáticamente strings ISO de dayjs a objetos datetime
    fecha: datetime
    descripcion: str
    referencia: Optional[str] = None
    ingreso: float = 0.0
    egreso: float = 0.0
    adicionales: Optional[str] = None

class EfectivoUpdate(EfectivoBase):
    # Para actualizaciones, el ID de la DB es obligatorio
    id: int 

class SyncPayload(BaseModel):
    # Ya no enviamos ID en 'created', solo los datos base
    created: List[EfectivoBase] 
    updates: List[EfectivoUpdate]

class SyncResponse(BaseModel):
    success: bool
    message: str

class EfectivoOut(EfectivoBase):
    id: int
    
    class Config:
        from_attributes = True

class DeleteRequest(BaseModel):
    ids: List[int]


class SaldosIndependientes(BaseModel):
    saldo_caja_chica: float
    saldo_bcp_soles: float
    saldo_bcp_dolares: float

    class Config:
        from_attributes = True
