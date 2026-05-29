
CREATE TABLE IF NOT EXISTS administracion.global_proveedores (
    id BIGSERIAL PRIMARY KEY,
    tipo_documento CHAR(1) NOT NULL, -- 1: DNI, 6: RUC
    nro_documento VARCHAR(15) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    direccion TEXT, -- direccion fiscal
    contactos JSONB, -- Estructura flexible para telf, emails, etc.
    status_sunat CHAR(1) DEFAULT '0', -- 0 = activo, 1 = suspendido, 2 = baja
    is_active BOOLEAN DEFAULT TRUE, -- para eliminacion segura
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- fecha de creación del registro
)
