-- 1. Tabla Maestra
CREATE TABLE IF NOT EXISTS tesoreria.obligaciones_eventuales (
    id BIGSERIAL PRIMARY KEY,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    empresa VARCHAR(100) NOT NULL,
    detalle VARCHAR(600),
    monto_esperado NUMERIC(12, 2) NOT NULL CHECK (monto_esperado >= 0),
    moneda CHAR(3) NOT NULL, 
    activo BOOLEAN DEFAULT TRUE, -- <--- ESTA ES TU LLAVE DE BORRADO LÓGICO
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS tesoreria.registros_pagos_eventuales (
    id BIGSERIAL PRIMARY KEY,
    obligacion_id INTEGER NOT NULL, -- Mantenemos NOT NULL porque el padre siempre existirá
    fecha_operacion DATE NOT NULL DEFAULT CURRENT_DATE,
    lugar_salida VARCHAR(20), 
    monto_pagado NUMERIC(12, 2) NOT NULL CHECK (monto_pagado >= 0),
    medio_pago VARCHAR(20), 
    status_cobro VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, CANCELADO
    glosa_pago TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_obligacion 
        FOREIGN KEY (obligacion_id) 
        REFERENCES tesoreria.obligaciones_eventuales(id) 
        ON DELETE RESTRICT -- <--- CAMBIO CRÍTICO: Protección contra accidentes
);
