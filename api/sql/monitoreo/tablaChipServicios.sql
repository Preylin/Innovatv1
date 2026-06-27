
CREATE TABLE IF NOT EXISTS administracion.tabla_chips_servicios_monitoreo (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL, -- referencia a global_clientes.id
    ubicacion_id BIGINT NOT NULL, -- referencia a tabla_ubicaciones_monitoreo.id
    chip_id BIGINT NOT NULL, -- referencia a tabla_chips_inventario_monitoreo.id
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fact_relacionada VARCHAR(6),
    estado VARCHAR(11) DEFAULT 'PENDIENTE', -- PENDIENTE, RENOVADO, NO RENOVADO
    adicional VARCHAR(255), -- para cualquier información adicional que se quiera registrar
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- fecha de registro del monitoreo
    FOREIGN KEY (cliente_id) REFERENCES administracion.global_clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (ubicacion_id) REFERENCES administracion.tabla_ubicaciones_monitoreo(id) ON DELETE CASCADE,
    FOREIGN KEY (chip_id) REFERENCES administracion.tabla_chips_inventario_monitoreo(id) ON DELETE CASCADE
)