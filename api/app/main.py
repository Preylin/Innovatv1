import logging
from fastapi import FastAPI
from app.api.v1.routes.auth import auth, usuario
from app.api.v1.routes.modulos.administracion.monitoreo.router_wather_pro_monitoreo_administracion import router_weather, router_pro
from app.api.v1.routes.modulos.administracion.monitoreo.router_clientes_ubicacion_chips_monitoreo_administracion import router_clientes, router_chips, rourter_ubicaciones
from app.core.db import init_db, dispose_db, check_db_connection
from fastapi.middleware.cors import CORSMiddleware

# CONFIGURACIÓN GLOBAL DE LOGGING
# Esto debe existir solo aquí, antes de crear la app.
logging.basicConfig(
    level=logging.INFO,  # Usa INFO en producción
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("app.main")


# FASTAPI APP

app = FastAPI()

# configuracio cors
origins = [
    "http://66.94.108.125:8080", "http://localhost:5173" # Vite default port (ajusta si usas otro)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # en desarrollo puedes usar ["*"], pero ver nota abajo
    allow_credentials=True,            # si envías Authorization o cookies
    allow_methods=["*"],               # permite GET,POST,OPTIONS,...
    allow_headers=["*"],               # permite Authorization, Content-Type, etc.
)

# STARTUP
@app.on_event("startup")
async def on_startup():
    logger.info("Inicializando base de datos...")
    init_db()
    logger.info("Verificando conexión a la base de datos...")
    if not await check_db_connection():
        logger.error("❌ Falló la conexión con la base de datos en startup.")
        raise RuntimeError("DB connection failed at startup")
    logger.info("✅ Conexión exitosa con la base de datos. API lista.")

# SHUTDOWN
@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Cerrando conexiones y liberando recursos de la base de datos...")
    await dispose_db()
    logger.info("Base de datos cerrada correctamente. 🚀")

# Rutas de la API v1
app.include_router(auth.router)
app.include_router(usuario.router)
app.include_router(router_clientes)
app.include_router(router_chips)
app.include_router(rourter_ubicaciones)
app.include_router(router_weather)
app.include_router(router_pro)
