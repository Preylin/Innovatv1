-- Aseguramos que el esquema exista
CREATE SCHEMA IF NOT EXISTS tesoreria;

-- 1. Tabla Maestra
CREATE TABLE tesoreria.obligaciones_fijas (
    id SERIAL PRIMARY KEY,
    empresa VARCHAR(100) NOT NULL,
    detalle VARCHAR(600),
    monto_esperado NUMERIC(12, 2) NOT NULL CHECK (monto_esperado >= 0),
    moneda CHAR(3) NOT NULL, 
    dia_pago SMALLINT NOT NULL CHECK (dia_pago BETWEEN 1 AND 31),
    categoria VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE, -- <--- ESTA ES TU LLAVE DE BORRADO LÓGICO
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Transacciones
CREATE TABLE tesoreria.registros_pagos (
    id SERIAL PRIMARY KEY,
    obligacion_id INTEGER NOT NULL, -- Mantenemos NOT NULL porque el padre siempre existirá
    fecha_operacion DATE NOT NULL DEFAULT CURRENT_DATE,
    mes_correspondiente DATE NOT NULL,
    monto_pagado NUMERIC(12, 2) NOT NULL CHECK (monto_pagado >= 0),
    comprobante VARCHAR(50),
    estado_pago VARCHAR(20) NOT NULL CHECK (estado_pago IN ('TOTAL', 'PARCIAL', 'ADELANTADO')),
    metodo_pago VARCHAR(30),
    observaciones TEXT,
    
    CONSTRAINT fk_obligacion 
        FOREIGN KEY (obligacion_id) 
        REFERENCES tesoreria.obligaciones_fijas(id) 
        ON DELETE RESTRICT -- <--- CAMBIO CRÍTICO: Protección contra accidentes
);

-- Índices recomendados para velocidad de búsqueda
CREATE INDEX idx_pagos_obligacion ON tesoreria.registros_pagos(obligacion_id);
CREATE INDEX idx_pagos_mes ON tesoreria.registros_pagos(mes_correspondiente);