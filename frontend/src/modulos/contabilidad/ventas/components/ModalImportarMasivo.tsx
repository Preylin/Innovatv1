import { z } from "zod";
import ExcelJS from "exceljs";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Button,
  Alert,
  Typography,
  Space,
  App,
  Modal,
  Progress,
} from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import type { ApiError } from "../../../../api/normalizeError";
import api from "../../../../api/client";
// import type { ApiError } from "../../../api/normalizeError"; // Ajusta según tu proyecto
// import api from "../../../api/client";

const { Text } = Typography;

// --- Esquema de Validación Ajustado a tu BD de Ventas ---
const HistorialVentasImportSchema = z.object({
  periodo: z.coerce.string().length(6, "Formato YYYYMM"),
  fecha_emision: z
    .union([z.date(), z.string().transform((v) => new Date(v))])
    .pipe(z.date()),
  fecha_vencimiento: z
    .union([z.date(), z.string().transform((v) => new Date(v))])
    .pipe(z.date())
    .optional(),
  tipo_cp_codigo: z.coerce.string().min(1).max(2),
  serie: z.string().min(1).max(4),
  numero: z.coerce.string().min(1),
  // Datos del Cliente (para la lógica masiva)
  nro_documento: z.coerce.string().min(8).max(11),
  razon_social: z.string().min(1),
  tipo_documento: z.string().length(1), // 1 o 6
  // Valores
  moneda: z.string().default("PEN"),
  tipo_cambio: z.coerce.number().min(1),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  total: z.coerce.number(),
  // Administrativo
  descripcion_comprobante: z.string().optional(),
  categoria: z.string().optional(),
});

type HistorialVentasImport = z.infer<typeof HistorialVentasImportSchema>;

// Headers esperados en el Excel (deben coincidir con las llaves del Schema)
const EXPECTED_HEADERS = [
  "periodo",
  "fecha_emision",
  "fecha_vencimiento",
  "tipo_cp_codigo",
  "serie",
  "numero",
  "nro_documento",
  "razon_social",
  "tipo_documento",
  "moneda",
  "tipo_cambio",
  "base_imponible",
  "igv",
  "total",
  "descripcion_comprobante",
  "categoria",
];

export default function HistorialVentasImportMasivaExcel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>(
    [],
  );
  const [parsingProgress, setParsingProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "parsing" | "ready" | "error" | "uploading"
  >("idle");

  const { message } = App.useApp();
  const qc = useQueryClient();
  const reset = useCallback(() => {
    setFile(null);
    setRowsCount(0);
    setErrors([]);
    setParsingProgress(0);
    setStatus("idle");
  }, []);
  const handleClose = useCallback(() => {
    if (status === "uploading" || status === "parsing") return;
    onClose();
    setTimeout(reset, 300);
  }, [status, onClose, reset]);

  const parseFile = async (file: File) => {
    setStatus("parsing");
    setErrors([]);
    setParsingProgress(0);

    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("Hoja no encontrada");

      const headers: string[] = [];
      worksheet
        .getRow(1)
        .eachCell((c) => headers.push(c.text?.toLowerCase().trim()));

      const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0)
        throw new Error(`Columnas faltantes: ${missing.join(", ")}`);

      const validRows: HistorialVentasImport[] = [];
      const rowErrors: { row: number; messages: string[] }[] = [];
      const totalRows = worksheet.rowCount - 1;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const rowData: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const h = headers[colNumber - 1];
          if (h) {
            const rawValue = cell.value;
            // Manejo de fechas de ExcelJS y resultados de fórmulas
            rowData[h] =
              rawValue && typeof rawValue === "object" && "result" in rawValue
                ? rawValue.result
                : rawValue;
          }
        });

        const result = HistorialVentasImportSchema.safeParse(rowData);
        if (!result.success) {
          rowErrors.push({
            row: rowNumber,
            messages: result.error.issues.map(
              (e) => `${e.path.join(".")}: ${e.message}`,
            ),
          });
        } else {
          validRows.push(result.data);
        }

        if (rowNumber % 20 === 0 || rowNumber === worksheet.rowCount) {
          setParsingProgress(Math.round(((rowNumber - 1) / totalRows) * 100));
        }
      });

      if (rowErrors.length > 0) {
        setErrors(rowErrors);
        setStatus("error");
      } else {
        setRowsCount(validRows.length);
        setFile(file);
        setStatus("ready");
      }
    } catch (err: any) {
      setErrors([{ row: 0, messages: [err.message] }]);
      setStatus("error");
    }
  };

  const mutation = useMutation<void, ApiError, FormData>({
    mutationFn: (fd) =>
      api.post("/contabilidad/ventas/importar-ventas-excel", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onMutate: () => setStatus("uploading"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["historial-ventas"] });
      message.success("Importación completada correctamente");
    },
    onError: (err: any) => {
    setStatus("error");
    // Al haber arreglado el interceptor, err.message ya contiene el texto realizado por el validador
    const finalMessage = err.message || "Error en el servidor";

    message.error(finalMessage);
  },
  });

  const onSubmit = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    mutation.mutate(fd);
    onClose();
  };

  return (
    <Modal
      title="Importación Masiva de Ventas"
      open={open}
      onCancel={handleClose}
      closable={status !== "uploading"}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
          disabled={status === "uploading"}
        >
          Cancelar
        </Button>,
        <Button
          key="ok"
          type="primary"
          onClick={onSubmit}
          loading={status === "uploading"}
          disabled={status !== "ready"}
        >
          Confirmar e Importar {rowsCount > 0 && `(${rowsCount} filas)`}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Upload.Dragger
          accept=".xlsx"
          beforeUpload={(file) => {
            parseFile(file);
            return false;
          }}
          showUploadList={false}
          disabled={status === "parsing" || status === "uploading"}
        >
          <p className="ant-upload-drag-icon">
            {status === "parsing" ? <LoadingOutlined /> : <UploadOutlined />}
          </p>
          <p className="ant-upload-text">Haz clic o arrastra el Excel aquí</p>
        </Upload.Dragger>

        {status === "parsing" && (
          <div style={{ textAlign: "center" }}>
            <Text>Validando datos...</Text>
            <Progress percent={parsingProgress} status="active" />
          </div>
        )}

        {status === "ready" && (
          <Alert
            message="Validación exitosa"
            description={`Se han procesado ${rowsCount} registros correctamente.`}
            type="success"
            showIcon
          />
        )}

        {errors.length > 0 && (
          <Alert
            type="error"
            message="Errores encontrados"
            description={
              <div style={{ maxHeight: 180, overflowY: "auto" }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ fontSize: "12px" }}>
                    <strong>Fila {e.row || "General"}:</strong>{" "}
                    {e.messages.join(", ")}
                  </div>
                ))}
              </div>
            }
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
}
