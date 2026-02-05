import type { ApiError } from "../api/normalizeError";

/**
 * Mapea los errores de ApiError (412, 422) directamente a los campos de TanStack Form
 */
export const setFormErrors = (err: ApiError, formApi: any, fieldChecker?: (f: string) => boolean) => {
  if (err.kind === "validation" && err.data) {
    err.data.forEach((e) => {
      const rawField = e.loc.at(-1);
      if (typeof rawField === "string" && fieldChecker?.(rawField)) {
        formApi.setFieldMeta(rawField, (meta: any) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onSubmit: e.msg },
        }));
      }
    });
  }
};

/**
 * Limpia el error de 'onSubmit' (backend) cuando el usuario modifica el input
 */
export const handleFieldChange = (field: any, value: any) => {
  // Extraer el valor si es un evento de React (Input) o usar el valor directo (Select)
  const actualValue = (value?.target) ? value.target.value : value;
  
  field.handleChange(actualValue);

  // Si existe un error de backend, lo limpiamos para mejorar la UX
  if (field.state.meta.errorMap?.onSubmit) {
    field.setMeta((prev: any) => ({
      ...prev,
      errorMap: { ...prev.errorMap, onSubmit: undefined },
    }));
  }
};


export function getFieldError(field: any): string | undefined {
  const meta = field.state.meta;

  // 1. Intentar obtener el primer error del array meta.errors (es lo más común en TanStack)
  if (meta.errors?.length > 0) {
    const firstError = meta.errors[0];
    if (typeof firstError === 'string') return firstError;
    // Zod suele poner el mensaje en .message, si no, intentamos stringify
    return (firstError as any)?.message ?? (typeof firstError === 'object' ? JSON.stringify(firstError) : String(firstError));
  }

  // 2. Revisar el errorMap (para errores específicos de eventos)
  const errorMapValues = Object.values(meta.errorMap || {});
  if (errorMapValues.length > 0) {
    const firstMapError = errorMapValues[0] as any;
    if (typeof firstMapError === 'string') return firstMapError;
    if (firstMapError?.message) return firstMapError.message;
  }

  return undefined;
}