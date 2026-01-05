
from pydantic import BaseModel, field_validator, EmailStr, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime

# Definición de variables globales
EstadoUsuario = Literal['activo', 'bloqueado']

# ---MODELO PARA PERMISO---

class PermisoBase(BaseModel):
    """
    Esquema base para los permisos.
    Define los campos comunes para la creación y lectura de permisos.
    """
    name_module: str

class PermisoCreate(PermisoBase):
    """
    Esquema para la creación de un permiso.
    Hereda de PermisoBase y añade el ID del usuario al que pertenece.
    """
    usuario_id: int

class PermisoCreateIn(BaseModel):
    name_module: str

class PermisoOut(PermisoBase):
    """
    Esquema para la salida (lectura) de un permiso.
    Muestra todos los campos del permiso, incluyendo su ID y fechas de creación.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    created_at: datetime

# ---MODELO PARA USUARIO---

class UsuarioBase(BaseModel):
    """
    Esquema base para los usuarios.
    Define los campos comunes para la creación y lectura de usuarios.
    """
    name: str
    last_name: str
    email: EmailStr
    cargo: str
    estado: EstadoUsuario = 'bloqueado'
    image_byte: Optional[bytes] = Field(default=None, repr=False)

class UsuarioCreate(UsuarioBase):
    """
    Esquema para la creación de un nuevo usuario.
    Hereda de UsuarioBase y añade el campo de contraseña y una lista de permisos.
    Incluye una validación para la longitud de la contraseña.
    """
    password: str
    permisos: List[PermisoCreateIn] = Field(default_factory=list)

    @field_validator('password')
    def pwd_len(cls, v: str) -> str:
        """Valida que la contraseña tenga al menos 8 caracteres."""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

class UsuarioUpdate(BaseModel):
    """
    Esquema para la actualización de un usuario.
    Todos los campos son opcionales, permitiendo actualizaciones parciales.
    """
    name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    cargo: Optional[str] = None
    estado: Optional[EstadoUsuario] = None
    password: Optional[str] = None
    image_byte: Optional[bytes] = Field(default=None, repr=False)
    permisos: Optional[List[PermisoCreateIn]] = None

class UsuarioOut(BaseModel):
    """
    Esquema para la salida (lectura) de un usuario.
    Define la estructura de datos que se devuelve al cliente, excluyendo
    información sensible como la contraseña.
    `from_attributes=True` permite que el modelo se cree a partir de un objeto ORM.
    """
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

# Nota: Se usa 'image_byte' en lugar de 'image' para evitar conflictos con posibles atributos reservados.
# Nota2: Se utiliza ConfigDict en UsuarioOut para habilitar la creación de instancias desde objetos ORM.
# Nota3: Solo se usa ConfigDict en UsuarioOut, ya que es el único esquema que requiere esta funcionalidad. No es necesario en los otros esquemas. Por lo tanto, no se incluye en UsuarioBase, UsuarioCreate o UsuarioUpdate. Porque no se espera que estos esquemas se creen directamente desde objetos ORM.