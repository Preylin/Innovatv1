# app/core/security.py
# --- seguridad: hash de contraseñas y manejo de JWT ---
"""
Módulo de seguridad para la aplicación.

Contiene funciones para el hashing y verificación de contraseñas
utilizando bcrypt, así como para la creación y decodificación
de JSON Web Tokens (JWT) para la autenticación de usuarios.
"""
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings

# --- hash de contraseñas ---
def hash_password(password: str) -> str:
    """
    Genera un hash de la contraseña proporcionada utilizando bcrypt.

    Args:
        password: La contraseña en texto plano.

    Returns:
        El hash de la contraseña codificado en UTF-8.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con un hash dado.

    Args:
        password: La contraseña en texto plano a verificar.
        hashed: El hash de la contraseña almacenado.

    Returns:
        True si la contraseña coincide con el hash, False en caso contrario.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# --- manejo de JWT ---
def create_access_token(subject: dict, expires_minutes: int | None = None) -> str:
    """
    Crea un JSON Web Token (JWT) de acceso.

    Args:
        subject: Un diccionario que representa el "subject" del token (ej. {"sub": user_id}).
        expires_minutes: Tiempo de expiración del token en minutos. Si es None,
                        se utiliza el valor por defecto de las configuraciones.

    Returns:
        El token JWT codificado como una cadena de texto.
    """
    if expires_minutes is None:
        expires_minutes = settings.JWT_EXPIRE_MINUTES
    now = datetime.now(timezone.utc)
    if isinstance(subject, dict):
        sub = subject.get("sub") or subject.get("id") or subject
    elif hasattr(subject, "id"):
        sub = getattr(subject, "id")
    else:
        sub = subject
    sub = str(sub)

    to_encode = {
        "sub": sub, #id del usuario,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALG)

def decode_access_token(token: str) -> dict:
    """
    Decodifica y verifica un JSON Web Token (JWT).

    Args:
        token: El token JWT a decodificar.

    Returns:
        El payload (cuerpo) del token decodificado como un diccionario.

    Raises:
        jwt.PyJWTError: Si el token es inválido, ha expirado o la firma es incorrecta.
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALG])