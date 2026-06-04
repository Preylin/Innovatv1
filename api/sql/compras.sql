CREATE SCHEMA IF NOT EXISTS contabilidad;

-- 3. Compras (Registro Principal)
CREATE TABLE IF NOT EXISTS contabilidad.compras (
    id BIGSERIAL PRIMARY KEY,
    periodo CHAR(6) NOT NULL, -- YYYYMM
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    
    -- Datos del Comprobante
    tipo_cp_codigo CHAR(2) NOT NULL, -- 01, 03, 07, etc.
    serie CHAR(4) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    proveedor_id BIGINT REFERENCES administracion.global_proveedores(id) NOT NULL,
    
    -- Valores Monetarios
    moneda CHAR(3) DEFAULT 'PEN', 
    tipo_cambio NUMERIC(12,3) DEFAULT 1.000,
    base_imponible NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    igv NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    no_gravadas NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    otros NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    
    -- Control Administrativo
    nro_guia_remision VARCHAR(50),
    
    -- Otros del SIRE / Gestión
    descripcion_comprobante TEXT,
    is_active CHAR(1) DEFAULT '1', -- 0 = anulado, 1 = activo
    link_pdf TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tesorería (Flujo de Caja)
CREATE TABLE IF NOT EXISTS contabilidad.caja_movimientos_compras (
    id BIGSERIAL PRIMARY KEY,
    compra_id BIGINT REFERENCES contabilidad.compras(id),
    fecha_pago DATE NOT NULL,
    lugar_salida VARCHAR(20), 
    monto_pagado NUMERIC(12,2) NOT NULL,
    medio_pago VARCHAR(20), 
    status_cobro VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, CANCELADO
    glosa_pago TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contabilidad (Libro Diario)
CREATE TABLE IF NOT EXISTS contabilidad.libro_diario_compras (
    id BIGSERIAL PRIMARY KEY,
    compra_id BIGINT REFERENCES contabilidad.compras(id), -- Origen: Provisión de la venta
    caja_id BIGINT REFERENCES contabilidad.caja_movimientos_compras(id), -- Origen: Asiento de pago
    fecha_contable DATE NOT NULL,
    periodo_contable CHAR(6) NOT NULL,
    cuenta_codigo VARCHAR(10) REFERENCES contabilidad.plan_contable(cuenta_codigo),
    debe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    haber NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    glosa_asiento TEXT,
    correlativo_asiento VARCHAR(20), -- Nro de voucher
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- INSERT INTO contabilidad.caja_movimientos_compras (
--     compra_id, fecha_pago, lugar_salida, monto_pagado, medio_pago, status_cobro, glosa_pago
-- )
-- SELECT
--     c.id,
--     c.fecha_emision,
--     'BCP',
    
--     CASE
--         WHEN c.moneda = 'USD' THEN
--             ROUND(c.total / c.tipo_cambio, 2)
--         ELSE
--             c.total
--     END,
--     'TRANSFERENCIA',
--     'CANCELADO',
--     'Migración masiva - Caja bimoneda'

-- FROM contabilidad.compras c
-- WHERE c.is_active = '1'
--   AND NOT EXISTS (
--       SELECT 1 FROM contabilidad.caja_movimientos_compras c WHERE c.compra_id = c.id
--   );