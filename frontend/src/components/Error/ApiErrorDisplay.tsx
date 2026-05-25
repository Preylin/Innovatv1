// src/components/ApiErrorDisplay.tsx
import { type FC } from "react";
import { ApiError } from "../../api/normalizeError";

interface ApiErrorDisplayProps {
  error: unknown; // Recibe el error crudo de React Query
}

export const ApiErrorDisplay: FC<ApiErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  // 1. Verificar si es una instancia de tu clase ApiError
  if (error instanceof ApiError) {
    
    // CASO 1: Errores de Validación (Objetos/Arrays de FastAPI o Zod)
    if (error.kind === "validation" && error.data && error.data.length > 0) {
      return (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
          <p className="font-semibold mb-2">Por favor, corrige los siguientes campos:</p>
          <ul className="list-disc pl-5 space-y-1">
            {error.data.map((err, index) => {
              const field = err.loc ? err.loc.filter(l => l !== "body" && l !== "query").join(" -> ") : "";
              return (
                <li key={index}>
                  {field ? <strong className="capitalize">{field}: </strong> : null}
                  {err.msg}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    // CASO 2 y 3: Errores HTTP genéricos o Strings directos (tu clase ya guardó el string en super(message))
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
        <span className="font-semibold">Error {error.httpStatus ? `(${error.httpStatus})` : ""}:</span> {error.message}
      </div>
    );
  }

  // CASO 4: Fallback por si ocurre un error nativo de JS que no pasó por la API
  return (
    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
      <span className="font-semibold">Error inesperado:</span> {error instanceof Error ? error.message : "Error desconocido"}
    </div>
  );
};