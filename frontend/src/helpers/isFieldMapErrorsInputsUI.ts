import { z, ZodObject } from 'zod';

/**
 * Helper genérico para validar si un string pertenece a las llaves de un ZodObject, permite maperar errores del api con referencia al input
 */
export function createFieldChecker<T extends ZodObject<any, any>>(schema: T) {
  const keys = schema.keyof();
  return (field: string): field is Extract<keyof z.infer<T>, string> => {
    return keys.safeParse(field).success;
  };
}
