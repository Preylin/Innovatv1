# main.py
import logging
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import auth
from app.core.security import decode_access_token
from app.core.realtime import db_to_redis_bridge, manager
from app.core.db import init_db, dispose_db, check_db_connection

from app.api.v1.auth import usuario
from app.api.v1.almacen.catalogos.RouterAlmacenCatalogosMerMat import router_catalogoMercaderia, router_catalogoMaterial
from app.api.v1.almacen.catalogos.RouterAlmacenIngresoMercaderia import router_ingresoMercaderia
from app.api.v1.almacen.catalogos.RouterAlmacenIngresoMaterial import router_ingresoMaterial
from app.api.v1.almacen.catalogos.RouterAlmacenSalidaMercaderia import router_salidaMercaderia
from app.api.v1.almacen.catalogos.RouterAlmacenSalidaMaterial import router_salidaMaterial
from app.api.v1.gerencia.inicio.RouterGerenciaInicioProvClient import router_clientesGerenciaInicio, router_proveedoresGerenciaInicio
from app.api.v1.tesoreria.routers.RouterTesoreriaEfectivo import router_cajachica, router_bcpsoles, router_bcpdolares
from app.api.v1.tesoreria.routers.RouterTesoreriaCntPorPagar import router_cuentasporpagar
from app.api.v1.contabilidad.ventas.routerVentas import router_contabilidad_ventas
from app.api.v1.tesoreria.routers.RouterTesoreriaCntPorCobrar import router_tesoreria_cuentasporcobrar
from app.api.v1.administracion.historial.routerHistorial import router_administracion_historial
from app.api.v1.contabilidad.compras.routerCompras import router_contabilidad_compras
from app.api.v1.administracion.monitoreo.routers.router_weather import router_servicio_weather
from app.api.v1.administracion.monitoreo.routers.router_pro import router_servicio_pro
from app.api.v1.administracion.monitoreo.routers.router_MC import router_servicio_mc
from app.api.v1.administracion.monitoreo.routers.router_inventario_chips import router_servicio_inventario_chips
from app.api.v1.administracion.monitoreo.routers.router_chips import router_servicio_chips
from app.api.v1.administracion.globalClienteProveedor.router_clientes_global import router_clientes_global







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
app.include_router(router_catalogoMercaderia)
app.include_router(router_catalogoMaterial)
app.include_router(router_ingresoMercaderia)
app.include_router(router_ingresoMaterial)
app.include_router(router_salidaMercaderia)
app.include_router(router_salidaMaterial)
app.include_router(router_clientesGerenciaInicio)
app.include_router(router_proveedoresGerenciaInicio)
app.include_router(router_cajachica)
app.include_router(router_bcpsoles)
app.include_router(router_bcpdolares)
app.include_router(router_cuentasporpagar)
app.include_router(router_contabilidad_ventas)
app.include_router(router_tesoreria_cuentasporcobrar)
app.include_router(router_administracion_historial)
app.include_router(router_contabilidad_compras)
app.include_router(router_servicio_weather)
app.include_router(router_servicio_pro)
app.include_router(router_servicio_mc)
app.include_router(router_servicio_inventario_chips)
app.include_router(router_servicio_chips)
app.include_router(router_clientes_global)