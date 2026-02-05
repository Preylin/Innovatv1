import { z } from "zod";
import ExcelJS from "exceljs";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Button, Alert, Typography, Space, App, Modal, Progress } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import type { ApiError } from "../../../../api/normalizeError";
import api from "../../../../api/client";


const { Text } = Typography;

/* ====================================================== 
   1️⃣ Esquema de Validación
   ====================================================== */

const ChipImportSchema = z.object({
  ruc: z.string().min(3, "minimo 3 caracteres").max(11, "ruc inválido"),
  cliente: z.string().min(3, "cliente requerido"),
});

type ChipImport = z.infer<typeof ChipImportSchema>;
const EXPECTED_HEADERS = ["ruc", "cliente"];

/* ====================================================== 
   2️⃣ Componente UI
   ====================================================== */
export default function ClienteListImportMasiva({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>([]);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "error" | "uploading">("idle");
  
  const { message } = App.useApp();
  const qc = useQueryClient();

  // Reset de estados: Limpia todo para la próxima vez que se abra
  const reset = useCallback(() => {
    setFile(null);
    setRowsCount(0);
    setErrors([]);
    setParsingProgress(0);
    setStatus("idle");
  }, []);

  const handleClose = useCallback(() => {
    // Evitar que el usuario cierre el modal mientras hay procesos críticos
    if (status === "uploading" || status === "parsing") return;
    
    onClose(); // Primero notificamos al padre para cerrar
    setTimeout(reset, 300); // Limpiamos después de que la animación de cierre termine
  }, [status, onClose, reset]);

  /* ---- Lógica de parseo ---- */
  const parseFile = async (file: File) => {
    setStatus("parsing");
    setErrors([]); // Limpiar errores previos si intentan subir otro archivo
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
      const seenruc = new Set();
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
          if (seenruc.has(result.data.ruc)) {
            rowErrors.push({ row: rowNumber, messages: ["ruc duplicado en el archivo"] });
          } else {
            seenruc.add(result.data.ruc);
            validRows.push(result.data);
          }
        }

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
    mutationFn: (fd) => api.post("/clientesGerenciaInicio/import", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    onMutate: () => setStatus("uploading"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientesLista"] });
      message.success("Importación completada correctamente");
      onClose();
    },
    onError: (err) => {
      setStatus("error");
      message.error(err.message || "Error en el servidor al procesar el Excel");
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
      title="Importación Masiva de Clientes"
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
          Confirmar e Importar
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
          <p className="ant-upload-text">Haz clic o arrastra el archivo Excel aquí</p>
        </Upload.Dragger>

        {status === "parsing" && (
          <div style={{ textAlign: 'center' }}>
            <Text>Analizando registros del Excel...</Text>
            <Progress percent={parsingProgress} status="active" />
          </div>
        )}

        {status === "uploading" && (
          <div style={{ textAlign: 'center' }}>
            <Text strong>Guardando en base de datos...</Text>
            <Progress percent={100} status="active" strokeColor="#52c41a" />
          </div>
        )}

        {status === "ready" && (
          <Alert
            message="Validación exitosa"
            description={`Se han encontrado ${rowsCount} registros listos para importar.`}
            type="success"
            showIcon
          />
        )}

        {errors.length > 0 && (
          <Alert
            type="error"
            message="No se puede procesar el archivo"
            description={
              <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 8 }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <Text strong>Fila {e.row > 0 ? e.row : "General"}:</Text> {e.messages.join(", ")}
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