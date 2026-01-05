// ChipImport.tsx
import { z } from "zod";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Button, Alert, Typography, Spin, Space, App, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../../../api/client";
import { ApiError, toApiError } from "../../../api/normalizeError";

export function useCreateChipMasivo() {
  const qc = useQueryClient();
  const { message } = App.useApp();

  return useMutation<void, ApiError, FormData>({
    mutationFn: async (formData) => {
      try {
        await api.post("/chips/import", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        throw toApiError(err);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chips"] });
      message.success("Importación exitosa");
    },
    onError: (err) => {
      if (err.kind === "validation" && err.data) {
        err.data.forEach((e) => {
          const field = e.loc.join(".");
          message.error(`${field}: ${e.msg}`);
        });
      } else {
        message.error(err.message);
      }
    },
  });
}


/* ======================================================
   1️⃣ Utilidad: Excel date → ISO string (UTC)
   ====================================================== */
/**
 * Excel guarda fechas como números seriales (sistema 1900).
 * Esta conversión es estándar en ETL y BI.
 */
function excelDateToISO(value: unknown): string | undefined {
  // Caso Excel serial (number)
  if (typeof value === "number") {
    const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
    return jsDate.toISOString();
  }

  // Caso Date (algunos XLSX lo entregan así)
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Caso string (por ejemplo: 2023-10-15)
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

/* ======================================================
   2️⃣ Campo de fecha robusto para Zod
   ====================================================== */
const dateField = z.preprocess(
  (v) => excelDateToISO(v),
  z.iso.datetime("Error de formato de fecha")
);

/* ======================================================
   3️⃣ Schema Zod (alineado con Pydantic)
   ====================================================== */
const ChipImportSchema = z.object({
  numero: z.coerce.number().int().positive(),
  iccid: z.string().min(10),
  operador: z.string().min(1),
  mb: z.string().min(1),
  activacion: dateField,
  instalacion: dateField,
  adicional: z.string().optional().default(""),
});

type ChipImport = z.infer<typeof ChipImportSchema>;

const EXPECTED_HEADERS = [
  "numero",
  "iccid",
  "operador",
  "mb",
  "activacion",
  "instalacion",
  "adicional",
] as const;

type ExpectedHeader = (typeof EXPECTED_HEADERS)[number];

/* ======================================================
   4️⃣ Parseo XLSX (solo Excel)
   ====================================================== */
async function parseXlsx(
  file: File
): Promise<{ headers: string[]; rows: unknown[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Headers reales (fila 1)
  const headerRow = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 0,
  })[0] as string[];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: undefined,
  });

  return {
    headers: headerRow.map((h) => h?.toString().trim()),
    rows,
  };
}

// validacion de headers

type HeaderValidationError = {
  missing: string[];
  extra: string[];
};

function validateHeaders(headers: string[]): HeaderValidationError | null {
  const normalized = headers.map((h) => h.toLowerCase());

  const missing = EXPECTED_HEADERS.filter((h) => !normalized.includes(h));

  const extra = normalized.filter(
    (h) => !EXPECTED_HEADERS.includes(h as ExpectedHeader)
  );

  if (missing.length === 0 && extra.length === 0) return null;

  return { missing, extra };
}

/* ======================================================
   5️⃣ Validación por filas
   ====================================================== */
type RowValidationError = {
  row: number;
  errors: Record<string, string[]>;
};

function validateRows(rows: unknown[]) {
  const valid: ChipImport[] = [];
  const errors: RowValidationError[] = [];

  rows.forEach((row, index) => {
    const result = ChipImportSchema.safeParse(row);

    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: index + 2, // fila real en Excel (1 = header)
        errors: result.error.flatten().fieldErrors,
      });
    }
  });

  return { valid, errors };
}

/* ======================================================
   6️⃣ Componente UI
   ====================================================== */

const { Text } = Typography;

export default function ChipImport(
    {open,
    onClose,}: {
      open: boolean;
      onClose: () => void;
    }
) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ChipImport[]>([]);
  const [errors, setErrors] = useState<RowValidationError[]>([]);

  /* ---- Upload backend ---- */
  const mutation = useCreateChipMasivo();

  /* ---- Selección y validación ---- */
  const beforeUpload = async (file: File) => {
    // reset total
    setFile(null);
    setRows([]);
    setErrors([]);

    setFile(file);

    const { headers, rows: rawRows } = await parseXlsx(file);

    const headerError = validateHeaders(headers);

    if (headerError) {
      setErrors([
        {
          row: 1,
          errors: {
            headers: [
              ...(headerError.missing.length
                ? [`Faltan columna/as: ${headerError.missing.join(", ")}`]
                : []),
              ...(headerError.extra.length
                ? [`Columnas no permitidas: ${headerError.extra.join(", ")}`]
                : []),
            ],
          },
        },
      ]);

      return false;
    }

    const { valid, errors } = validateRows(rawRows);

    setRows(valid);
    setErrors(errors);

    return false; // ⛔ antd no sube automático
  };

  /* ---- Envío ---- */
  const onSubmit = () => {
  if (!file || rows.length === 0 || errors.length > 0) return;

  const formData = new FormData();
  formData.append("file", file);

  mutation.mutate(formData);
};

  return (
    <Modal
      title={"Importar chips"}
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
    >
      <div style={{ maxWidth: 900 }}>
      {/* Upload */}
      <Upload
        accept=".xlsx"
        maxCount={1}
        beforeUpload={beforeUpload}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Seleccionar archivo XLSX</Button>
      </Upload>

      {/* Info archivo */}
      {file && (
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          Archivo seleccionado: <strong>{file.name}</strong>
        </Text>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <Alert
          type="error"
          title={`Errores de validación (${errors.length})`}
          description={
            <Space orientation="vertical" size={4}>
              {errors.map((e) => (
                <Text key={e.row} type="danger">
                  Fila {e.row}: {JSON.stringify(e.errors)}
                </Text>
              ))}
            </Space>
          }
        />
      )}

      {/* Botón */}
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={onSubmit}
          disabled={!file || rows.length === 0 || errors.length > 0}
        >
          {mutation.isPending ? <Spin size="small" /> : "Importar"}
        </Button>
      </div>
    </div>
      </Modal>
  );
}
