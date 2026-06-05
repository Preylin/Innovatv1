SELECT
        gp.razon_social,
        c.fecha_vencimiento,
        c.moneda,
        CASE 
            WHEN c.moneda = 'USD' THEN ROUND((c.total / NULLIF(c.tipo_cambio, 0))::numeric, 2)
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
               WHEN c.moneda = 'USD' THEN ROUND((c.total / NULLIF(c.tipo_cambio, 0))::numeric, 2)
               ELSE c.total 
           END