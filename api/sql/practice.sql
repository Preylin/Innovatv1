SELECT
    v.id,
    v.periodo,
    v.fecha_emision,
    v.fecha_vencimiento,
    c.nro_documento,
    c.razon_social,
    v.total,
    v.moneda,
    v.tipo_cambio,
    cmv.fecha_pago,
    COALESCE(cmv.monto_pagado, 0) AS monto_pagado,
    COALESCE(cmv.status_cobro, 'PENDIENTE') AS status_cobro,
    v.link_pdf
FROM contabilidad.ventas v
INNER JOIN contabilidad.clientes c 
    ON v.cliente_id = c.id
LEFT JOIN contabilidad.caja_movimientos_ventas cmv 
    ON v.id = cmv.venta_id
WHERE v.periodo = '202502'
ORDER BY v.fecha_emision;