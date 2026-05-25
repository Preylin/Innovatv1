// core/errors.tsx
import type { AnyFieldApi } from "@tanstack/react-form";

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  const meta = field.state.meta;

  // 1. Obtener errores locales (Zod) si existen
  const localErrors = meta.errors.map((err: any) => 
    typeof err === "string" ? err : err?.message
  ).filter(Boolean);

  // 2. Obtener error del backend (FastAPI) si existe en el errorMap
  const backendError = meta.errorMap?.onSubmit;

  // 3. Combinamos ambos en un solo arreglo
  const rawErrors = [...localErrors, backendError].filter(Boolean);

  //  El truco: Convertir a Set elimina automáticamente los strings idénticos
  const uniqueErrors = Array.from(new Set(rawErrors));

  // Mostramos el error si el campo fue tocado y tenemos algún mensaje único
  const hasErrors = uniqueErrors.length > 0;
  const shouldShow = meta.isTouched && hasErrors;

  return (
    <>
      {shouldShow ? (
        <em className="text-red-700 text-[10px] ml-1">
          {uniqueErrors.join(", ")}
        </em>
      ) : null}
      {meta.isValidating ? "Validating..." : null}
    </>
  );
}