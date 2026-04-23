from datetime import datetime
from typing import List, Optional

from fastapi import UploadFile, File, Form
import json

from pydantic import BaseModel

# Esquema para recibir el JSON stringificado
class ProductoIn(BaseModel):
    uuid_mercaderia: str
    codigo: str
    name: str
    marca: str
    modelo: str
    medida: str
    dimension: Optional[str]
    categoria: str
    serie: List[dict] # Solo traerá {"codigo": "..."}
    valor: float
    ubicacion: str

class IngresoGlobalIn(BaseModel):
    ruc: str
    proveedor: str
    serieNumCP: Optional[str]
    serieNumGR: Optional[str]
    condicion: str
    fecha: datetime
    moneda: str
    productos: List[ProductoIn]