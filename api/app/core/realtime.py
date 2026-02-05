#realtime.py
import asyncio
import aiopg
import logging
from redis import asyncio as aioredis
from redis.exceptions import ConnectionError as RedisConnectionError
from app.core.config import settings

logger = logging.getLogger("app.realtime")

# DSN compatible con aiopg (sin el prefijo +asyncpg)
# aiopg usa el driver psycopg2 internamente para el LISTEN/NOTIFY
DB_DSN = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

async def db_to_redis_bridge():
    """
    Escucha NOTIFY de Postgres y publica en Redis.
    Maneja reconexión automática y cierre limpio de tareas.
    """
    retry_delay = 5
    while True:
        try:
            logger.info("Realtime Bridge: Conectando a infraestructura...")
            # Inicializamos Redis dentro del bucle para asegurar reconexión
            redis = aioredis.from_url(settings.REDIS_URL)
            
            async with aiopg.create_pool(DB_DSN) as pool:
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute("LISTEN global_db_changes")
                        logger.info("Realtime Bridge: ESCUCHANDO cambios en PostgreSQL.")
                        retry_delay = 5  # Resetear delay tras conexión exitosa
                        
                        while True:
                            try:
                                # Escuchamos notificaciones de Postgres con timeout
                                # Usamos '_' porque el contenido del mensaje no nos es crítico, solo el evento
                                _ = await asyncio.wait_for(conn.notifies.get(), timeout=1.0)
                                
                                # Publicamos en el bus de Redis para que todos los workers/WebSockets se enteren
                                await redis.publish("broadcast_channel", "refresh")
                                logger.debug("Cambio en DB detectado -> Notificado a Redis.")
                                
                            except asyncio.TimeoutError:
                                # El timeout es solo para que el bucle sea interrumpible (ej. al apagar el server)
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
        self.redis_url = settings.REDIS_URL

    async def broadcast_handler(self, websocket):
        """
        Maneja la suscripción a Redis para un cliente WebSocket específico.
        """
        redis = aioredis.from_url(self.redis_url)
        pubsub = redis.pubsub()
        
        try:
            # ignore_subscribe_messages=True evita procesar el mensaje técnico de 'suscribir'
            await pubsub.subscribe("broadcast_channel")
            logger.info("🔌 WebSocket: Suscrito a Redis correctamente.")
            
            while True:
                # 1. Escuchar mensajes de Redis (No bloqueante con timeout)
                # NOTA: Usamos ignore_subscribe_messages aquí también por seguridad
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
                
                if message and message['type'] == 'message':
                    # Decodificamos si es necesario y notificamos al cliente
                    await websocket.send_text("invalidate_all")
                    logger.info("Notificación enviada al Frontend.")

                # 2. CRUCIAL: Pausa mínima para permitir que el Event Loop procese 
                # otras peticiones HTTP entrantes (evita el estado "Cargando..." infinito)
                await asyncio.sleep(0.01)

                # 3. Verificar estado de la conexión
                if websocket.client_state.name == "DISCONNECTED":
                    break

        except Exception as e:
            logger.error(f"Error en broadcast_handler: {e}")
        finally:
            # Limpieza de recursos al desconectar
            try:
                await pubsub.unsubscribe("broadcast_channel")
                await pubsub.close()
                await redis.close()
            except Exception:
                pass
            logger.info("WebSocket: Canal Redis liberado.")

manager = ConnectionManager()



"""
se usa aiopg  y no asyncpg porque:
1. aiopg tiene una implementacion sencilla y robusta del protocolo LISTEN/NOTIFY de Postgresql.
2. permite manejar la conexion de escucha de forma independiente al pool de conexiones del API,
evitando que el socket de notificaciones bloquee las consultas normales.
"""