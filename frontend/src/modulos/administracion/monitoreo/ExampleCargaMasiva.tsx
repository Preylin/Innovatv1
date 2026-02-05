import { z } from "zod";
import ExcelJS from "exceljs";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Button, Alert, Typography, Space, App, Modal, Progress } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import api from "../../../api/client";
import { ApiError } from "../../../api/normalizeError";

const { Text } = Typography;

/* ====================================================== 
   1️⃣ Esquema de Validación
   ====================================================== */
const dateSchema = z.union([
  z.date(),
  z.iso.datetime(),
  z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" })
]).pipe(z.coerce.date());

const ChipImportSchema = z.object({
  numero: z.coerce.number().int().positive("Número requerido"),
  iccid: z.string().min(10, "ICCID inválido"),
  operador: z.string().min(1, "Operador requerido"),
  mb: z.coerce.string().min(1, "MB requerido"),
  activacion: dateSchema,
  instalacion: dateSchema,
  adicional: z.string().optional().nullable().transform(val => val ?? ""),
});

type ChipImport = z.infer<typeof ChipImportSchema>;
const EXPECTED_HEADERS = ["numero", "iccid", "operador", "mb", "activacion", "instalacion"];

/* ====================================================== 
   2️⃣ Componente UI
   ====================================================== */
export default function ChipImport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>([]);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "error" | "uploading">("idle");
  
  const { message } = App.useApp();
  const qc = useQueryClient();

  // Reset de estados
  const reset = useCallback(() => {
    setFile(null);
    setRowsCount(0);
    setErrors([]);
    setParsingProgress(0);
    setStatus("idle");
  }, []);

  const handleClose = () => {
    if (status === "uploading" || status === "parsing") return;
    reset();
    onClose();
  };

  /* ---- Lógica de parseo con progreso ---- */
  const parseFile = async (file: File) => {
    setStatus("parsing");
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

      const validRows: ChipImport[] = [];
      const rowErrors: { row: number; messages: string[] }[] = [];
      const seenIccid = new Set();
      const totalRows = worksheet.rowCount - 1;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const rowData: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const h = headers[colNumber - 1];
          if (h) rowData[h] = cell.value;
        });

        const result = ChipImportSchema.safeParse(rowData);
        if (!result.success) {
          rowErrors.push({ row: rowNumber, messages: result.error.issues.map(e => e.message) });
        } else {
          if (seenIccid.has(result.data.iccid)) {
            rowErrors.push({ row: rowNumber, messages: ["ICCID duplicado en el archivo"] });
          } else {
            seenIccid.add(result.data.iccid);
            validRows.push(result.data);
          }
        }

        // Actualizar progreso cada 50 filas para no saturar el renderizado
        if (rowNumber % 50 === 0 || rowNumber === worksheet.rowCount) {
          setParsingProgress(Math.round(((rowNumber - 1) / totalRows) * 100));
        }
      });

      setRowsCount(validRows.length);
      setErrors(rowErrors);
      setStatus(rowErrors.length > 0 ? "error" : "ready");
      setFile(file);

    } catch (err: any) {
      setErrors([{ row: 0, messages: [err.message] }]);
      setStatus("error");
    }
  };

  /* ---- Mutación de subida ---- */
  const mutation = useMutation<void, ApiError, FormData>({
    mutationFn: (fd) => api.post("/chips/import", fd),
    onMutate: () => setStatus("uploading"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chips"] });
      message.success("Datos importados correctamente");
      handleClose();
    },
    onError: (err) => {
      setStatus("error");
      message.error(err.message || "Error al subir el archivo");
    }
  });

  const onSubmit = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    mutation.mutate(fd);
  };

  return (
    <Modal
      title="Importación Masiva"
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
          {status === "uploading" ? "Subiendo..." : "Confirmar Importación"}
        </Button>
      ]}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        <Upload.Dragger
          accept=".xlsx"
          beforeUpload={(file) => { parseFile(file); return false; }}
          showUploadList={false}
          disabled={status === "parsing" || status === "uploading"}
        >
          <p className="ant-upload-drag-icon">
            {status === "parsing" ? <LoadingOutlined /> : <UploadOutlined />}
          </p>
          <p className="ant-upload-text">Haz clic o arrastra el archivo Excel aquí</p>
        </Upload.Dragger>

        {status === "parsing" && (
          <div style={{ textAlign: 'center' }}>
            <Text>Analizando registros...</Text>
            <Progress percent={parsingProgress} status="active" />
          </div>
        )}

        {status === "uploading" && (
          <div style={{ textAlign: 'center' }}>
            <Text strong>Subiendo al servidor...</Text>
            <Progress percent={100} status="active" strokeColor="#52c41a" />
          </div>
        )}

        {status === "ready" && (
          <Alert
            title="Archivo validado"
            description={`Se procesarán ${rowsCount} chips exitosamente.`}
            type="success"
            showIcon
          />
        )}

        {errors.length > 0 && (
          <Alert
            type="error"
            title="Errores de validación encontrados"
            description={
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {errors.map((e, i) => (
                  <div key={i}><Text strong>Fila {e.row}:</Text> {e.messages.join(", ")}</div>
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