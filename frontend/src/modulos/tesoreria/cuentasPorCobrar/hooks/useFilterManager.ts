import { useState, useMemo, useCallback } from "react";
import ExcelJS from "exceljs";
import type { ReporteCobrosPagosActualSchemaApiType } from "../data/api.schemaCntsCobrarTableReporte";
import { FilterManagerIntelligence, type DataGeneral, type SaldosFinancieros } from "./FilterManagerIntelligent";

export function useFilterManager(
  apiData: ReporteCobrosPagosActualSchemaApiType[] | undefined,
  saldosApi: SaldosFinancieros | undefined
) {
  const [rangoFechas, setRangoFechas] = useState<[Date | null, Date | null] | null>(null);
  const [itemsCheckState, setItemsCheckState] = useState<Record<string, boolean>>({});

  // 1. Normalizar información combinando estado local de checkboxes
  const dataNormalizada = useMemo<DataGeneral[]>(() => {
    if (!apiData) return [];
    return apiData.map((item, index) => {
      const key = `${item.tabla}-${index}-${item.razon_social}`;
      const monto_total = item.monto_total || 0;
      const monto_pagado = item.monto_pagado || 0;
      
      return {
        key,
        nombre: item.razon_social || "Sin Nombre",
        fecha_vencimiento: item.fecha_vencimiento ? new Date(item.fecha_vencimiento) : null,
        moneda: item.moneda || "PEN",
        monto_total,
        monto_pagado,
        monto_pendiente: Math.max(0, monto_total - monto_pagado),
        tabla: item.tabla || "",
        is_check: itemsCheckState[key] ?? true, 
        dias: FilterManagerIntelligence.calcularTextoVencimiento(item.fecha_vencimiento),
      };
    });
  }, [apiData, itemsCheckState]);

  // 2. Instanciar cerebro de filtros
  const brain = useMemo(() => new FilterManagerIntelligence(dataNormalizada, saldosApi), [dataNormalizada, saldosApi]);
  const datosFiltrados = useMemo(() => brain.filtrarPorRangoFecha(rangoFechas), [brain, rangoFechas]);

  const cuentasCobrar = useMemo(() => datosFiltrados.obtenerCuentasPorCobrar(), [datosFiltrados]);
  const cuentasPagar = useMemo(() => datosFiltrados.obtenerCuentasPorPagar(), [datosFiltrados]);

  const totalCuentasCobrar = cuentasCobrar.length;
  const totalCuentasPagar = cuentasPagar.length;

  const totalesCobrar = useMemo(() => datosFiltrados.calcularTotalesGrupo(cuentasCobrar), [datosFiltrados, cuentasCobrar]);
  const totalesPagar = useMemo(() => datosFiltrados.calcularTotalesGrupo(cuentasPagar), [datosFiltrados, cuentasPagar]);

  const totalesGenerales = useMemo(() => {
    return datosFiltrados.calcularTotalGeneral(totalesCobrar, totalesPagar);
  }, [datosFiltrados, totalesCobrar, totalesPagar]);

  const toggleCheck = (key: string) => {
    setItemsCheckState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Función core e inmutable de exportación a Excel
  const exportarGrupoAExcel = useCallback(async (dataGrupo: DataGeneral[], tituloReporte: string) => {
    if (dataGrupo.length === 0) {
      alert("No hay registros disponibles para exportar en este grupo.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte");

    // Definición explícita y tipada de columnas basada en la estructura visual actual
    worksheet.columns = [
      { header: "Razón Social / Nombre", key: "nombre", width: 35 },
      { header: "Módulo / Tabla", key: "tabla", width: 15 },
      { header: "Moneda", key: "moneda", width: 12 },
      { header: "Monto Pendiente", key: "monto_pendiente", width: 20 },
      { header: "Estado Vencimiento", key: "dias", width: 22 },
    ];

    // Estilización de la fila de cabecera (Slate-800 acorde a Shadcn UI)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0F172A" }, 
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 24;

    // Insertar filas dinámicas basándose en el estado exacto de la UI
    dataGrupo.forEach((item) => {
      const row = worksheet.addRow({
        nombre: item.nombre,
        tabla: item.tabla,
        moneda: item.moneda,
        monto_pendiente: item.monto_pendiente,
        dias: item.dias,
      });

      // Formatear celda numérica monetaria
      const cellMonto = row.getCell("monto_pendiente");
      cellMonto.numFmt = "#,##0.00";
      cellMonto.alignment = { horizontal: "right" };

      // Centrar campos cortos
      row.getCell("moneda").alignment = { horizontal: "center" };
      row.getCell("tabla").alignment = { horizontal: "center" };
    });

    // Auto-ajuste fino de bordes en la cuadrícula
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E2E8F0" } },
            bottom: { style: "thin", color: { argb: "E2E8F0" } },
            left: { style: "thin", color: { argb: "E2E8F0" } },
            right: { style: "thin", color: { argb: "E2E8F0" } },
          };
        });
      }
    });

    // Buffer y descarga nativa en navegador
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tituloReporte}_${timestamp}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  return {
    cuentasCobrar,
    cuentasPagar,
    totalCuentasCobrar,
    totalCuentasPagar,
    totalesCobrar,
    totalesPagar,
    totalesGenerales,
    setRangoFechas,
    toggleCheck,
    exportarCobros: () => exportarGrupoAExcel(cuentasCobrar, "Cuentas_Por_Cobrar"),
    exportarPagos: () => exportarGrupoAExcel(cuentasPagar, "Cuentas_Por_Pagar"),
  };
}