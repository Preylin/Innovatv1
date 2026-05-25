-- select * from contabilidad.caja_movimientos_ventas;



-- drop schema contabilidad cascade;
-- drop table administracion.global_clientes;


-- INSERT INTO contabilidad.caja_movimientos_ventas (
--     venta_id, fecha_pago, lugar_ingreso, monto_pagado, medio_pago, status_cobro, glosa_pago
-- )
-- SELECT 
--     v.id, 
--     v.fecha_emision, 
--     'BCP', 
--     -- Nueva lógica aplicando retenciones y detracciones
--     CASE 
--         WHEN v.moneda = 'USD' THEN 
--             ROUND(v.total / v.tipo_cambio, 2) - (COALESCE(v.monto_retencion, 0) + COALESCE(v.monto_detraccion, 0))
--         ELSE 
--             v.total - (COALESCE(v.monto_retencion, 0) + COALESCE(v.monto_detraccion, 0))
--     END,
--     'TRANSFERENCIA', 
--     'CANCELADO', 
--     'Migración masiva - Caja bimoneda'
--     -- , v.moneda -- <- Descomenta si guardas la moneda en caja
-- FROM contabilidad.ventas v
-- WHERE v.is_active = '1'
--   AND NOT EXISTS (
--       SELECT 1 FROM contabilidad.caja_movimientos_ventas c WHERE c.venta_id = v.id
--   );


select * 
from contabilidad.ventas v
where v.periodo like '2026%'
