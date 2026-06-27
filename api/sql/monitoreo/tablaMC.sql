

CREATE TABLE IF NOT EXISTS administracion.tabla_serviciomc_monitoreo (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL, -- referencia a global_clientes.id
    ubicacion_id BIGINT NOT NULL, -- referencia a tabla_ubicaciones_monitoreo.id
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fact_relacionada VARCHAR(6),
    informe VARCHAR(10),
    certificado VARCHAR(10),
    encargado VARCHAR(100),
    tecnico VARCHAR(100),
    servicio VARCHAR(255),
    incidencia VARCHAR(255), -- para cualquier información adicional que se quiera registrar
    estado VARCHAR(11) DEFAULT 'PENDIENTE', -- PENDIENTE, RENOVADO, NO RENOVADO
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- fecha de registro del monitoreo
    FOREIGN KEY (cliente_id) REFERENCES administracion.global_clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (ubicacion_id) REFERENCES administracion.tabla_ubicaciones_monitoreo(id) ON DELETE CASCADE
)