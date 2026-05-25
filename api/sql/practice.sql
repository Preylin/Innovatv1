-- select * from contabilidad.caja_movimientos_ventas;



drop schema contabilidad cascade;
drop table administracion.global_clientes;

-- INSERT INTO contabilidad.caja_movimientos_ventas (
--     venta_id, fecha_pago, lugar_ingreso, monto_pagado, medio_pago, status_cobro, glosa_pago
--     -- , moneda -- <- Si agregas esta columna a tu tabla de caja, descomenta esto
-- )
-- SELECT 
--     v.id, 
--     v.fecha_emision, 
--     'BCP', 
--     -- Si la venta fue en USD, dividimos el total en soles entre el TC para obtener los dólares reales
--     CASE 
--         WHEN v.moneda = 'USD' THEN ROUND(v.total / v.tipo_cambio, 2)
--         ELSE v.total -- Si es PEN, pasa el total directo
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

