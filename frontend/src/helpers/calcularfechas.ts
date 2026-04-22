// utils/dateUtils.ts
interface Datos {
    fecha_inicial: string;
    dia?: number;
    mes?: number;
    año?: number;
}

export function CalcularYMostrarDiasMesesAños({ fecha_inicial, dia = 0, mes = 0, año = 0 }: Datos): string {
    // Convertimos el string ISO a objeto Date
    const inicio = new Date(fecha_inicial);
    
    // Validamos que la fecha sea válida
    if (isNaN(inicio.getTime())) return "-";

    // Creamos la fecha final sumando los años_utiles
    const objetivo = new Date(
        inicio.getFullYear() + año,
        inicio.getMonth() + mes,
        inicio.getDate() + dia
    );

    const hoy = new Date();

    // Si la fecha objetivo ya pasó (depreciado totalmente)
    if (objetivo < hoy) {
        return "Vida útil agotada";
    }

    // Diferencia entre HOY y el OBJETIVO (lo que falta)
    let diffAños = objetivo.getFullYear() - hoy.getFullYear();
    let diffMeses = objetivo.getMonth() - hoy.getMonth();
    let diffDias = objetivo.getDate() - hoy.getDate();

    if (diffDias < 0) {
        const ultimoDiaMesAnterior = new Date(objetivo.getFullYear(), objetivo.getMonth(), 0).getDate();
        diffDias += ultimoDiaMesAnterior;
        diffMeses--;
    }

    if (diffMeses < 0) {
        diffMeses += 12;
        diffAños--;
    }

    // Total de días restantes
    const totalDiasRestantes = Math.floor((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    return `${totalDiasRestantes} días (Faltan: ${diffAños} años, ${diffMeses} meses y ${diffDias} días)`;
}