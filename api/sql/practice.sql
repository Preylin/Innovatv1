-- SELECT
--     v.id,
--     v.periodo,
--     v.fecha_emision,
--     v.fecha_vencimiento,
--     c.nro_documento,
--     c.razon_social,
--     v.total,
--     v.moneda,
--     v.tipo_cambio,
--     cmv.fecha_pago,
--     COALESCE(cmv.monto_pagado, 0.00) AS monto_pagado,
--     COALESCE(cmv.status_cobro, 'PENDIENTE') AS status_cobro,
--     v.link_pdf
-- FROM contabilidad.ventas v
-- INNER JOIN administracion.global_clientes c 
--     ON v.cliente_id = c.id
-- LEFT JOIN contabilidad.caja_movimientos_ventas cmv 
--     ON v.id = cmv.venta_id
-- WHERE 
--     v.periodo LIKE '2025%' 
--     AND v.is_active = '1' 
-- ORDER BY 
--     v.fecha_emision ASC;


WITH descripciones_unicas AS (
    SELECT descripcion, 
           ROW_NUMBER() OVER (ORDER BY descripcion) AS rn
    FROM tesoreria.bcpsoles
    WHERE descripcion IS NOT NULL
    GROUP BY descripcion
),
referencias_unicas AS (
    SELECT referencia, 
           ROW_NUMBER() OVER (ORDER BY referencia) AS rn
    FROM tesoreria.bcpsoles
    WHERE referencia IS NOT NULL
    GROUP BY referencia
),
adicionales_unicas AS (
    SELECT adicionales, 
           ROW_NUMBER() OVER (ORDER BY adicionales) AS rn
    FROM tesoreria.bcpsoles
    WHERE adicionales IS NOT NULL
    GROUP BY adicionales
)
SELECT 
    d.descripcion, 
    r.referencia,
    a.adicionales
FROM descripciones_unicas d
FULL OUTER JOIN referencias_unicas r ON d.rn = r.rn
FULL OUTER JOIN adicionales_unicas a ON COALESCE(d.rn, r.rn) = a.rn;
