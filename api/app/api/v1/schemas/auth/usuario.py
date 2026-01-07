
from pydantic import BaseModel, field_validator, EmailStr, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime

# Definición de variables globales
EstadoUsuario = Literal['activo', 'bloqueado']

# ---MODELO PARA PERMISO---

class PermisoBase(BaseModel):
    name_module: str

class PermisoCreate(PermisoBase):
    usuario_id: int

class PermisoCreateIn(BaseModel):
    name_module: str

class PermisoOut(PermisoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    created_at: datetime

# ---MODELO PARA USUARIO---

class UsuarioBase(BaseModel):
    name: str
    last_name: str
    email: EmailStr
    cargo: str
    estado: EstadoUsuario = 'bloqueado'
    image_byte: Optional[bytes] = Field(default=None, repr=False)

class UsuarioCreate(UsuarioBase):
    password: str
    permisos: List[PermisoCreateIn] = Field(default_factory=list)

    @field_validator('password')
    def pwd_len(cls, v: str) -> str:
        """Valida que la contraseña tenga al menos 8 caracteres."""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

class UsuarioUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    cargo: Optional[str] = None
    estado: Optional[EstadoUsuario] = None
    password: Optional[str] = None
    image_byte: Optional[bytes] = Field(default=None, repr=False)
    permisos: Optional[List[PermisoCreateIn]] = None

class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    last_name: str
    email: EmailStr
    cargo: str
    estado: EstadoUsuario
    image_base64: Optional[str] = None
    permisos: List[PermisoOut] = Field(default_factory=list)
    created_at: datetime
