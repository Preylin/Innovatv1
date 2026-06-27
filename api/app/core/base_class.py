# app/core/base_class.py
from sqlalchemy.orm import declarative_base

Base = declarative_base()

from app.api.v1.administracion.globalClienteProveedor.modelGlobalCliente import GlobalCliente
from app.api.v1.administracion.monitoreo.models.model_ubicaciones import TablaUbicacionesMonitoreo
# Asegúrate de importar el archivo donde está ServicioChips:

from app.api.v1.administracion.monitoreo.models.model_inventario_chips import InventarioChips
from app.api.v1.administracion.monitoreo.models.model_chips import ServicioChips
from app.api.v1.administracion.monitoreo.models.model_weather import ServicioWeather
from app.api.v1.administracion.monitoreo.models.model_pro import ServicioPro
from app.api.v1.administracion.monitoreo.models.model_MC import ServicioMC