import { z } from "zod";
import ExcelJS from "exceljs";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Button, Alert, Typography, Space, App, Modal, Progress } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import type { ApiError } from "../../../../api/normalizeError";
import api from "../../../../api/client";

const { Text } = Typography;


// --- Esquema de Validación ---
const HistorialMantenimientoCalibracionUISchema = z.object({
  empresa: z.string().min(1, "Empresa requerida"),
  ubicacion: z.string().min(1, "Ubicación requerida"),
  inicio: z.union([z.date(), z.string().transform((v) => new Date(v))]).pipe(z.date()),
  fin: z.union([z.date(), z.string().transform((v) => new Date(v))]).pipe(z.date()),
  servicio: z.string().min(1, "Servicio requerido"),
  informe: z.string().min(1, "Informe requerido"),
  certificado: z.string().min(1, "Certificado requerido"),
  encargado: z.string().min(1, "Encargado requerido"),
  tecnico: z.string().min(1, "Técnico requerido"),
  incidencia: z.string().min(1, "Incidencia requerida"),
  status: z.number(),
});

type HistorialMCUISchemaType = z.infer<typeof HistorialMantenimientoCalibracionUISchema>;
const EXPECTED_HEADERS = ['empresa', 'ubicacion', 'inicio', 'fin', 'servicio', 'informe', 'certificado', 'encargado', 'tecnico', 'incidencia', 'status'];

export default function HistorialMantenimientoCalibracionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>([]);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "error" | "uploading">("idle");
  
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

      if (!worksheet) throw new Error("Hoja de cálculo no encontrada");

      const headers: string[] = [];
      worksheet.getRow(1).eachCell((c) => headers.push(c.text.toLowerCase().trim()));

      const missing = EXPECTED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 0) throw new Error(`Columnas faltantes: ${missing.join(", ")}`);

      const validRows: HistorialMCUISchemaType[] = [];
      const rowErrors: { row: number; messages: string[] }[] = [];
      const totalRows = worksheet.rowCount - 1;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const rowData: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const h = headers[colNumber - 1];
          if (h) {
            // Manejo de celdas con fórmulas o valores enriquecidos
            const rawValue = cell.value;
            rowData[h] = (rawValue && typeof rawValue === 'object' && 'result' in rawValue) 
              ? rawValue.result 
              : rawValue;
          }
        });

        const result = HistorialMantenimientoCalibracionUISchema.safeParse(rowData);
        if (!result.success) {
          rowErrors.push({ 
            row: rowNumber, 
            messages: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`) 
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
    mutationFn: (fd) => api.post("/serviciosmc/import", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    onMutate: () => setStatus("uploading"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC"] });
      message.success("Importación completada correctamente");
    },
    onError: (err) => {
      setStatus("error");
      message.error(err.message || "Error en el servidor");
    }
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
      title="Importación Masiva de M/C"
      open={open}
      onCancel={handleClose}
      closable={status !== "uploading"}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={status === "uploading"}>
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
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Upload.Dragger
          accept=".xlsx"
          beforeUpload={(file) => { parseFile(file); return false; }}
          showUploadList={false}
          disabled={status === "parsing" || status === "uploading"}
        >
          <p className="ant-upload-drag-icon">
            {status === "parsing" ? <LoadingOutlined /> : <UploadOutlined />}
          </p>
          <p className="ant-upload-text">Haz clic o arrastra el Excel aquí</p>
        </Upload.Dragger>

        {status === "parsing" && (
          <div style={{ textAlign: 'center' }}>
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
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ fontSize: '12px' }}>
                    <strong>Fila {e.row || "General"}:</strong> {e.messages.join(", ")}
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