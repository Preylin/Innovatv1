from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone

# ---- HELPER / MIXIN ----
class DateTimeUTCMixin:
    @field_validator("inicio", "fin", mode="before", check_fields=False)
    @classmethod
    def normalize_datetime(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            # Maneja el formato ISO y el reemplazo de Z
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))
        
        # Si ya es un objeto datetime
        if isinstance(v, datetime):
            if v.tzinfo is None:
                return v.replace(tzinfo=timezone.utc)
            return v.astimezone(timezone.utc)
        return v

# Configuración compartida para modelos de salida (ORM Mode)
cfg_orm = ConfigDict(from_attributes=True)

# ---- SERVICIOSMC ----

class ServicioMCBase(BaseModel):
    empresa: str
    ubicacion: str
    inicio: datetime
    fin: datetime
    servicio: str
    informe: Optional[str] = None
    certificado: Optional[str] = None
    encargado: Optional[str] = None
    tecnico: Optional[str] = None
    incidencia: Optional[str] = None
    status: int = Field(default=0)  # 0=pendiente, 1=renovado, 2=No renovado

class ServicioMCCreate(DateTimeUTCMixin, ServicioMCBase):
    pass

class ServicioMCUpdate(DateTimeUTCMixin, BaseModel):
    empresa: Optional[str] = None
    ubicacion: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    servicio: Optional[str] = None
    informe: Optional[str] = None
    certificado: Optional[str] = None
    tecnico: Optional[str] = None
    incidencia: Optional[str] = None
    status: Optional[int] = None

class ServicioMCOut(ServicioMCBase):
    model_config = cfg_orm
    id: int
    created_at: datetime

