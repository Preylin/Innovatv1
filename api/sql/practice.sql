-- SELECT v.periodo, sum(v.total) as total_resumen, max(v.cliente_id) as cliente_id_max, min(v.cliente_id) as cliente_id_min
-- FROM contabilidad.ventas v
-- WHERE v.is_active = '1'
-- GROUP BY v.periodo
-- ORDER BY v.periodo;

-- drop table if exists administracion.tabla_weather_monitoreo;
-- drop table if exists administracion.tabla_pro_monitoreo;
-- drop table if exists administracion.tabla_serviciomc_monitoreo;
-- drop table if exists administracion.tabla_chips_servicios_monitoreo;
-- drop table if exists administracion.tabla_chips_inventario_monitoreo;
-- drop table if exists administracion.tabla_ubicaciones_monitoreo;

-- select c.ubicacion
-- from administracion.tabla_ubicaciones_monitoreo as c
-- ORDER BY c.ubicacion ASC;

-- select * from administracion.tabla_chips_servicios_monitoreo;