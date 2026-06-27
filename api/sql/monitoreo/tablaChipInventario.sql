
CREATE TABLE IF NOT EXISTS administracion.tabla_chips_inventario_monitoreo (
    id BIGSERIAL PRIMARY KEY,
    numero_chip VARCHAR(12) NOT NULL UNIQUE, -- número del chip
    iccid VARCHAR(30), -- ICCID del chip
    operador VARCHAR(20), -- operador del chip
    plan VARCHAR(15), -- plan asociado al chip
    fecha_activacion DATE,
    fecha_instalacion DATE,
    adicional VARCHAR(255), -- para cualquier información adicional que se quiera registrar
    is_active BOOLEAN DEFAULT TRUE, -- para eliminacion segura
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- fecha de registro del chip
    )