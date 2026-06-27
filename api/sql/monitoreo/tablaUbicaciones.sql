
CREATE TABLE IF NOT EXISTS administracion.tabla_ubicaciones_monitoreo (
    id BIGSERIAL PRIMARY KEY,
    ubicacion VARCHAR(255) NOT NULL UNIQUE, -- nombre o descripción de la ubicación
    is_active BOOLEAN DEFAULT TRUE, -- para eliminacion segura
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- fecha de registro de la ubicación
)