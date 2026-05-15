CREATE SCHEMA IF NOT EXISTS contabilidad;

-- 1. Plan Contable General Empresarial (PCGE)
CREATE TABLE contabilidad.plan_contable (
    cuenta_codigo VARCHAR(10) PRIMARY KEY, -- Ej: '1212', '40111', '70121'
    descripcion VARCHAR(150) NOT NULL,
    nivel INTEGER DEFAULT 2,
    tipo_cuenta VARCHAR(20), -- Activo, Pasivo, Patrimonio, Ingreso, Gasto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clientes / Contribuyentes
CREATE TABLE contabilidad.clientes (
    id BIGSERIAL PRIMARY KEY,
    tipo_documento CHAR(1) NOT NULL, -- 1: DNI, 6: RUC
    nro_documento VARCHAR(15) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    direccion TEXT,
    contactos JSONB, -- Estructura flexible para telf, emails, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ventas (Registro Principal)
CREATE TABLE contabilidad.ventas (
    id BIGSERIAL PRIMARY KEY,
    periodo CHAR(6) NOT NULL, -- YYYYMM
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    
    -- Datos del Comprobante
    tipo_cp_codigo CHAR(2) NOT NULL, -- 01, 03, 07, etc.
    serie CHAR(4) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    cliente_id BIGINT REFERENCES contabilidad.clientes(id),
    
    -- Valores Monetarios
    moneda CHAR(3) DEFAULT 'PEN', 
    tipo_cambio NUMERIC(12,3) DEFAULT 1.000,
    base_imponible NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    igv NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    
    -- Control Administrativo
    monto_retencion NUMERIC(12,2) DEFAULT 0.00,
    monto_detraccion NUMERIC(12,2) DEFAULT 0.00,
    nro_orden_compra VARCHAR(50),
    nro_guia_remision VARCHAR(50),
    
    -- Otros del SIRE / Gestión
    descripcion_comprobante TEXT,
    categoria VARCHAR(100), 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tesorería (Flujo de Caja)
CREATE TABLE contabilidad.caja_movimientos_ventas (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT REFERENCES contabilidad.ventas(id),
    fecha_pago DATE NOT NULL,
    lugar_ingreso VARCHAR(50), 
    monto_pagado NUMERIC(12,2) NOT NULL,
    medio_pago VARCHAR(20), 
    status_cobro VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PARCIAL, CANCELADO
    glosa_pago TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contabilidad (Libro Diario)
CREATE TABLE contabilidad.libro_diario_ventas (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT REFERENCES contabilidad.ventas(id), -- Origen: Provisión de la venta
    caja_id BIGINT REFERENCES contabilidad.caja_movimientos_ventas(id), -- Origen: Asiento de pago
    fecha_contable DATE NOT NULL,
    periodo_contable CHAR(6) NOT NULL,
    cuenta_codigo VARCHAR(10) REFERENCES contabilidad.plan_contable(cuenta_codigo),
    debe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    haber NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    glosa_asiento TEXT,
    correlativo_asiento VARCHAR(20), -- Nro de voucher
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

