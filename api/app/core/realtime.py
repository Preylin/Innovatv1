#realtime.py
import asyncio
import aiopg
import logging
from redis import asyncio as aioredis
from redis.exceptions import ConnectionError as RedisConnectionError
from fastapi import WebSocketDisconnect # Asegúrate de importar esto
from app.core.config import settings

logger = logging.getLogger("app.realtime")

# DSN compatible con aiopg (sin el prefijo +asyncpg)
# aiopg usa el driver psycopg2 internamente para el LISTEN/NOTIFY
DB_DSN = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

async def db_to_redis_bridge():
    """
    Escucha NOTIFY de Postgres y publica en Redis.
    Maneja reconexión automática y cierre limpio de tareas.
    """
    retry_delay = 5
    while True:
        try:
            logger.info("Realtime Bridge: Conectando a infraestructura...")
            # USAR EL CLIENTE GLOBAL, no crear uno nuevo con from_url(redis_client)
            
            async with aiopg.create_pool(DB_DSN) as pool:
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute("LISTEN global_db_changes")
                        logger.info("Realtime Bridge: ESCUCHANDO PostgreSQL.")
                        retry_delay = 5 
                        
                        while True:
                            try:
                                _ = await asyncio.wait_for(conn.notifies.get(), timeout=1.0)
                                # Usamos el cliente global directamente
                                await redis_client.publish("broadcast_channel", "refresh")
                                logger.debug("Cambio detectado -> Redis.")
                            except asyncio.TimeoutError:
                                continue

        except asyncio.CancelledError:
            logger.info("Realtime Bridge: Deteniendo tarea de forma limpia...")
            break
        except (aiopg.Error, RedisConnectionError, Exception) as e:
            logger.error(f"Realtime Bridge: Error ({e}). Reintentando en {retry_delay}s...")
            await asyncio.sleep(retry_delay)
            # Reintento exponencial limitado a 60 segundos
            retry_delay = min(retry_delay * 2, 60)

class ConnectionManager:
    def __init__(self):
        # Ya no necesitamos pasar la URL, usamos el cliente global
        pass

    async def broadcast_handler(self, websocket, user_id: str):
        pubsub = None
        try:
            pubsub = redis_client.pubsub()
            await pubsub.subscribe("broadcast_channel")
            
            online_key = f"user:online:{user_id}"
            last_refresh = asyncio.get_event_loop().time()

            while True:
                # 1. Chequeo de estado del socket (Crucial)
                # Si el estado no es CONNECTED, salimos ya.
                if websocket.client_state.name != "CONNECTED":
                    logger.info(f"Terminando zombie loop para usuario {user_id}")
                    break

                current_time = asyncio.get_event_loop().time()
                
                # 2. Heartbeat a Redis
                if current_time - last_refresh > 15: 
                    # Intentamos un PING al websocket para ver si sigue vivo
                    try:
                        # Enviamos un mensaje vacío o de tipo 'ping'
                        # Si el socket está muerto, esto lanzará una excepción
                        await asyncio.wait_for(websocket.send_json({"type": "ping"}), timeout=2.0)
                        
                        # Si el ping fue exitoso, renovamos en Redis
                        await redis_client.expire(online_key, 40)
                        last_refresh = current_time
                    except Exception:
                        # Si falla el envío del ping, el cliente es un zombie
                        logger.warn(f"Conexión zombie detectada para {user_id}. Limpiando.")
                        break

                # 3. Escuchar mensajes de Redis
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message['type'] == 'message':
                    try:
                        await websocket.send_text("invalidate_all")
                    except Exception:
                        break 

                await asyncio.sleep(0.5)

        finally:
            # IMPORTANTE: Cuando el loop se rompe (por zombie o cierre normal)
            # si queremos que desaparezca MÁS rápido, podemos borrarlo aquí
            # pero solo si no fue un refresh. Por ahora, dejemos que el TTL 
            # de 40s haga su trabajo tras dejar de recibir expires.
            if pubsub:
                await pubsub.unsubscribe("broadcast_channel")
                await pubsub.close()


manager = ConnectionManager()



"""
se usa aiopg  y no asyncpg porque:
1. aiopg tiene una implementacion sencilla y robusta del protocolo LISTEN/NOTIFY de Postgresql.
2. permite manejar la conexion de escucha de forma independiente al pool de conexiones del API,
evitando que el socket de notificaciones bloquee las consultas normales.
"""