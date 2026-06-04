INSERT INTO contabilidad.caja_movimientos_compras (
    compra_id, fecha_pago, lugar_salida, monto_pagado, medio_pago, status_cobro, glosa_pago
)
SELECT
    c.id,
    c.fecha_emision,
    'BCP',
    
    CASE
        WHEN c.moneda = 'USD' THEN
            ROUND(c.total / c.tipo_cambio, 2)
        ELSE
            c.total
    END,
    'TRANSFERENCIA',
    'CANCELADO',
    'Migración masiva - Caja bimoneda'

FROM contabilidad.compras c
WHERE c.is_active = '1'
  AND NOT EXISTS (
      SELECT 1 FROM contabilidad.caja_movimientos_compras c WHERE c.compra_id = c.id
  );