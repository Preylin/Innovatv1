import re
from typing import Any, Optional

def limpiar_texto(v: Any) -> Optional[str]:
    """Limpia saltos de línea, espacios múltiples y estandariza nulos para PostgreSQL."""
    if v is None:
        return None
        
    texto = str(v).strip().upper()
    
    # Conversión de nulos falsos a None real
    if texto in ("NAN", "NONE", "NAT", ""):
        return None
        
    # Reemplazo de saltos de línea y múltiples espacios
    texto = re.sub(r"[\n\r]", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    
    return texto.strip()
