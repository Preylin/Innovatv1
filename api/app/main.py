# main.py
import logging
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.security import decode_access_token
from app.core.realtime import db_to_redis_bridge, manager
from app.core.db import init_db, dispose_db, check_db_connection

from app.api.v1.routes.auth import auth, usuario
from app.api.v1.routes.modulos.administracion.monitoreo.router_wather_pro_monitoreo_administracion import router_weather, router_pro, router_chipservicio
from app.api.v1.routes.modulos.administracion.monitoreo.router_clientes_ubicacion_chips_monitoreo_administracion import router_clientes, router_chips, router_ubicaciones
from app.api.v1.routes.modulos.almacen.catalogos.RouterAlmacenCatalogosMerMat import router_catalogoMercaderia, router_catalogoMaterial
from app.api.v1.routes.modulos.administracion.monitoreo.routerAdministracionMonitoreoServiciosMC import router_serviciosmc
from app.api.v1.routes.modulos.almacen.catalogos.RouterAlmacenIngresoMercaderia import router_ingresoMercaderia
from app.api.v1.routes.modulos.almacen.catalogos.RouterAlmacenIngresoMaterial import router_ingresoMaterial
from app.api.v1.routes.modulos.almacen.catalogos.RouterAlmacenSalidaMercaderia import router_salidaMercaderia
from app.api.v1.routes.modulos.almacen.catalogos.RouterAlmacenSalidaMaterial import router_salidaMaterial
from app.api.v1.routes.modulos.gerencia.inicio.RouterGerenciaInicioProvClient import router_clientesGerenciaInicio, router_proveedoresGerenciaInicio
from app.api.v1.routes.modulos.administracion.ventas.RouterHistorialVentas import router_historialVentas
from app.api.v1.routes.modulos.administracion.ventas.RouterHistorialCompras import router_historialCompras


# CONFIGURACIÓN GLOBAL DE LOGGING
# Esto debe existir solo aquí, antes de crear la app.
logging.basicConfig(
    level=logging.INFO,  # Usa INFO en producción
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("app.main")

# FASTAPI APP

app = FastAPI(title="ERP Innovat API")


# configuracio cors
origins = [
    "https://innovatv1.kittnight.com",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # en desarrollo puedes usar ["*"], pero ver nota abajo
    allow_credentials=True,            # si envías Authorization o cookies
    allow_methods=["*"],               # permite GET,POST,OPTIONS,...
    allow_headers=["*"],               # permite Authorization, Content-Type, etc.
)

# Referencia para la tarea de fondo
realtime_task = None

# --- NUEVO ENDPOINT WEBSOCKET REFORZADO ---
@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_access_token(token)
        user_id = str(payload.get("sub"))
        await websocket.accept()
        
        from app.core.realtime import redis_client
        online_key = f"user:online:{user_id}"
        
        # 1. Marcamos presencia
        await redis_client.set(online_key, "1", ex=20) 
        
        # 2. Notificamos a todos que ALGUIEN ENTRÓ
        await redis_client.publish("broadcast_channel", "refresh")
        
        logger.info(f"🔌 WebSocket: Cliente {user_id} conectado.")
        
        try:
            await manager.broadcast_handler(websocket, user_id)
        finally:
            # 3. Notificamos a todos que ALGUIEN SALIÓ (o refrescó)
            # Aunque la clave no se borre (por el TTL), al enviar "refresh",
            # el frontend pedirá la lista /usuarios/online de nuevo.
            await redis_client.publish("broadcast_channel", "refresh")
            
            logger.info(f"🔌 WebSocket: Cliente {user_id} desconectado (notificando refresh).")

    except Exception as e:
        logger.error(f"❌ WebSocket Error: {e}")

@app.on_event("startup")
async def on_startup():
    global realtime_task
    init_db()
    if not await check_db_connection():
        raise RuntimeError("DB Connection Failed")
    
    # Iniciar el puente en segundo plano
    realtime_task = asyncio.create_task(db_to_redis_bridge())
    logger.info("✅ Servidor iniciado y Bridge activo.")

@app.on_event("shutdown")
async def on_shutdown():
    global realtime_task
    if realtime_task:
        realtime_task.cancel() # Cancelar tarea para evitar errores de "Task pending"
        try:
            await realtime_task
        except asyncio.CancelledError:
            pass
    await dispose_db()
    logger.info("🚀 API cerrada correctamente.")



# Rutas de la API v1
app.include_router(auth.router)
app.include_router(usuario.router)
app.include_router(router_clientes)
app.include_router(router_chips)
app.include_router(router_ubicaciones)
app.include_router(router_weather)
app.include_router(router_pro)
app.include_router(router_chipservicio)
app.include_router(router_serviciosmc)
app.include_router(router_catalogoMercaderia)
app.include_router(router_catalogoMaterial)
app.include_router(router_ingresoMercaderia)
app.include_router(router_ingresoMaterial)
app.include_router(router_salidaMercaderia)
app.include_router(router_salidaMaterial)
app.include_router(router_clientesGerenciaInicio)
app.include_router(router_proveedoresGerenciaInicio)
app.include_router(router_historialVentas)
app.include_router(router_historialCompras)