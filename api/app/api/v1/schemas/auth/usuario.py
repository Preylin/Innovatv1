from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# --- Tipos Globales ---
EstadoUsuario = Literal['activo', 'bloqueado']

# --- MODELOS PARA PERMISO ---

class PermisoBase(BaseModel):
    name_module: str

class PermisoCreate(PermisoBase):
    usuario_id: int

class PermisoCreateIn(PermisoBase):
    """Hereda de PermisoBase para evitar repetir name_module"""
    pass

class PermisoOut(PermisoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    created_at: datetime

# --- MODELOS PARA USUARIO ---

class Imagen(BaseModel):
    image_byte: str

class UsuarioBase(BaseModel):
    name: str
    last_name: str
    email: EmailStr
    cargo: str
    estado: EstadoUsuario = 'bloqueado'
    image_byte: List[Imagen] = Field(default_factory=list)

class UsuarioCreate(UsuarioBase):
    password: str
    permisos: List[PermisoCreateIn] = Field(default_factory=list)

    @field_validator('password')
    @classmethod
    def pwd_len(cls, v: str) -> str:
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
    image_byte: Optional[str] = None
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