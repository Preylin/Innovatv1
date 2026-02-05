from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator

# Configuración compartida para modelos de salida (ORM Mode)
cfg_orm = ConfigDict(from_attributes=True)

# ---- CLASE BASE MAESTRA ----

class CatalogoBase(BaseModel):
    codigo: str
    name: str
    marca: str
    modelo: str
    medida: str
    plimit: int
    dimension: Optional[str] = None
    descripcion: Optional[str] = None
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    imagen3: Optional[str] = None
    imagen4: Optional[str] = None


# ---- CATALOGO MERCADERIA ----

class CatalogoMercaderiaBase(CatalogoBase):
    categoria: str
    pass

class CatalogoMercaderiaCreate(CatalogoMercaderiaBase):
    pass

class CatalogoMercaderiaUpdate(BaseModel):
    codigo: Optional[str] = None
    name: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    medida: Optional[str] = None
    categoria: Optional[str] = None
    plimit: Optional[int] = None
    dimension: Optional[str] = None
    descripcion: Optional[str] = None
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    imagen3: Optional[str] = None
    imagen4: Optional[str] = None

class CatalogoMercaderiaOut(CatalogoMercaderiaBase):
    model_config = cfg_orm
    id: int
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def map_images_from_property(cls, data):
        # Si la propiedad existe en el objeto de la DB
        if hasattr(data, "imagenes_base64"):
            imgs = data.imagenes_base64
            # Mapeo dinámico: asigna imagen1, imagen2, etc.
            for key, value in imgs.items():
                setattr(data, key, value)
        return data


# ---- CATALOGO MATERIAL ----

class CatalogoMaterialBase(CatalogoBase):
    pass

class CatalogoMaterialCreate(CatalogoMaterialBase):
    tipo: str

class CatalogoMaterialUpdate(BaseModel):
    codigo: Optional[str] = None
    name: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    medida: Optional[str] = None
    tipo: Optional[str] = None
    plimit: Optional[int] = None
    dimension: Optional[str] = None
    descripcion: Optional[str] = None
    imagen1: Optional[str] = None
    imagen2: Optional[str] = None
    imagen3: Optional[str] = None
    imagen4: Optional[str] = None

class CatalogoMaterialOut(CatalogoMaterialBase):
    model_config = cfg_orm
    id: int
    tipo: str
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def map_images_from_property(cls, data):
        # Si la propiedad existe en el objeto de la DB
        if hasattr(data, "imagenes_base64"):
            imgs = data.imagenes_base64
            # Mapeo dinámico: asigna imagen1, imagen2, etc.
            for key, value in imgs.items():
                setattr(data, key, value)
        return data
