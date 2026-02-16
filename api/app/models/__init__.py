# models/__init__.py
from app.models.auth.auth_models import Usuario, Permiso
from app.models.modulos.administracion.monitoreo.matrices.models_matrices_monitoreo_administracion import Cliente, Ubicacion, Chip
from app.models.modulos.administracion.monitoreo.individuales.models_weather_pro_chips_monitoreo_administracion import Weather, Pro, ChipServicio
from app.models.modulos.administracion.monitoreo.individuales.modelsAdministracionMonitoreoServiciosMc import ServicioMC
from app.models.modulos.almacen.catalogos.ModelsAlmacenCatalogosMerMat import CatalogoMercaderia, CatalogoMaterial
from app.models.modulos.almacen.catalogos.ModelsAlmacenIngresoMaterial import IngresoMaterial
from app.models.modulos.almacen.catalogos.ModelsAlmacenIngresoMercaderia import IngresoMercaderia
from app.models.modulos.almacen.catalogos.ModelsAlmacenSalidaMaterial import SalidaMaterial
from app.models.modulos.almacen.catalogos.ModelsAlmacenSalidaMercaderia import SalidaMercaderia
from app.models.modulos.gerencia.inicio.ModelsGerenciaInicioProvClient import ClienteInicio, ProveedorInicio
from app.models.modulos.administracion.ventas.ModelHistorialCompras import HistorialCompras
from app.models.modulos.administracion.ventas.ModelHistorialVentas import HistorialVentas