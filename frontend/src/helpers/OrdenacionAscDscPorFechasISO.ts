/**
 * Ordena un arreglo de objetos por una propiedad de tipo fecha.
 * @param datos Arreglo de objetos a ordenar
 * @param key La propiedad del objeto que contiene la fecha (ej: 'created_at', 'inicio')
 * @param orden 'asc' para ascendente o 'desc' para descendente
 */
export const ordenarPorFecha = <T>(
  datos: T[], 
  key: keyof T, 
  orden: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...datos].sort((a, b) => {
    // Convertimos el valor a string para asegurar que Date() lo procese
    const valA = a[key] as unknown as string;
    const valB = b[key] as unknown as string;

    const fechaA = new Date(valA).getTime();
    const fechaB = new Date(valB).getTime();

    // Manejo de fechas inválidas (opcional pero recomendado)
    if (isNaN(fechaA) || isNaN(fechaB)) return 0;

    return orden === 'asc' ? fechaA - fechaB : fechaB - fechaA;
  });
};