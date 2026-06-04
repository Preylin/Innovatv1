CREATE OR REPLACE VIEW reporte_cobros_pagos_actual AS
(
    SELECT
        gc.razon_social,
        v.fecha_vencimiento,
        v.moneda,
        CASE 
            WHEN v.moneda = 'USD' THEN ROUND((v.total / v.tipo_cambio)::numeric, 2)
            ELSE v.total 
        END AS monto_total,
        COALESCE(SUM(cmv.monto_pagado), 0.00) AS monto_pagado,
        'VENTAS' AS tabla,
        TRUE AS is_check
    FROM contabilidad.ventas v
    LEFT JOIN contabilidad.caja_movimientos_ventas cmv ON v.id = cmv.venta_id
    JOIN administracion.global_clientes gc ON v.cliente_id = gc.id
    WHERE v.is_active = '1'
    GROUP BY v.id, gc.razon_social, v.fecha_vencimiento, v.moneda, v.total, v.tipo_cambio
    HAVING COALESCE(SUM(cmv.monto_pagado), 0.00) < 
           CASE 
               WHEN v.moneda = 'USD' THEN ROUND((v.total / v.tipo_cambio)::numeric, 2)
               ELSE v.total 
           END
)
UNION ALL
(
    SELECT
        gp.razon_social,
        c.fecha_vencimiento,
        c.moneda,
        CASE 
            WHEN c.moneda = 'USD' THEN ROUND((c.total / c.tipo_cambio)::numeric, 2)
            ELSE c.total 
        END AS monto_total,
        COALESCE(SUM(cmc.monto_pagado), 0.00) AS monto_pagado,
        'COMPRAS' AS tabla,
        TRUE AS is_check
    FROM contabilidad.compras c
    LEFT JOIN contabilidad.caja_movimientos_compras cmc ON c.id = cmc.compra_id
    JOIN administracion.global_proveedores gp ON c.proveedor_id = gp.id
    WHERE c.is_active = '1'
    GROUP BY c.id, gp.razon_social, c.fecha_vencimiento, c.moneda, c.total, c.tipo_cambio
    HAVING COALESCE(SUM(cmc.monto_pagado), 0.00) < 
           CASE 
               WHEN c.moneda = 'USD' THEN ROUND((c.total / c.tipo_cambio)::numeric, 2)
               ELSE c.total 
           END
)
UNION ALL
(
    SELECT
        oe.empresa AS razon_social,
        oe.fecha_vencimiento,
        oe.moneda,
        oe.monto_esperado AS monto_total,
        COALESCE(SUM(rpe.monto_pagado), 0.00) AS monto_pagado,
        'OE' AS tabla,
        TRUE AS is_check
    FROM tesoreria.obligaciones_eventuales oe
    LEFT JOIN tesoreria.registros_pagos_eventuales rpe ON oe.id = rpe.obligacion_id
    WHERE oe.activo = TRUE
    GROUP BY oe.id, oe.empresa, oe.fecha_vencimiento, oe.moneda, oe.monto_esperado
    HAVING COALESCE(SUM(rpe.monto_pagado), 0.00) < oe.monto_esperado
)
UNION ALL
(
    SELECT
        of.empresa AS razon_social,
        (DATE_TRUNC('month', CURRENT_DATE) + (of.dia_pago - 1) * INTERVAL '1 day')::date AS fecha_vencimiento,
        of.moneda,
        of.monto_esperado AS monto_total,
        COALESCE(SUM(rp.monto_pagado), 0.00) AS monto_pagado,
        'OF' AS tabla,
        TRUE AS is_check
    FROM tesoreria.obligaciones_fijas of
    LEFT JOIN tesoreria.registros_pagos rp ON of.id = rp.obligacion_id 
        AND DATE_TRUNC('month', rp.fecha_operacion) = DATE_TRUNC('month', CURRENT_DATE)
    WHERE of.activo = TRUE
    GROUP BY of.id, of.empresa, of.dia_pago, of.moneda, of.monto_esperado
    HAVING COALESCE(SUM(rp.monto_pagado), 0.00) < of.monto_esperado
)
ORDER BY fecha_vencimiento ASC;