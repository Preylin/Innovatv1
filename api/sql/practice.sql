SELECT v.periodo, sum(v.total) as total_resumen, max(v.cliente_id) as cliente_id_max, min(v.cliente_id) as cliente_id_min
FROM contabilidad.ventas v
WHERE v.is_active = '1'
GROUP BY v.periodo
ORDER BY v.periodo;




-- select * from contabilidad.ventas;