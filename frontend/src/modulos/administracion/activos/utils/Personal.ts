import type { Data } from "../types/personaTypes";

export class Personal {
    private items: Data[];

    constructor(items: Data[]) {
        // Al trabajar con APIs, la instancia recibe los datos frescos
        this.items = items;
    }

    // --- MÉTODOS DE ACCESO ---
    
    getAll(): Data[] {
        return this.items;
    }


    // --- MÉTODOS DE CÁLCULO POR FILA (INDIVIDUAL) ---

    /** Calcula el subtotal (Básico + Asignación) */
    static getSubtotalFila(item: Data): number {
        return item.rem_total;
    }

    /** Calcula el total de beneficios (Grati + CTS + Vacaciones) */
    static getBeneficiosFila(item: Data): number {
        return item.grati + item.cts + item.vacacion;
    }

    /** Calcula el total general de la fila (Soles) */
    static getTotalFila(item: Data): number {
        return this.getSubtotalFila(item) + this.getBeneficiosFila(item);
    }

    // --- MÉTODOS DE AGREGACIÓN (TOTALES DE COLUMNA) ---

    /** Suma cualquier columna numérica del array actual */
    sumarColumna(columna: keyof Data): number {
        return this.items.reduce((acc, item) => {
            const value = item[columna];
            return typeof value === 'number' ? acc + value : acc;
        }, 0);
    }

    /** Calcula el gran total de toda la planilla */
    getGranTotalPlanilla(): number {
        return this.items.reduce((acc, item) => acc + Personal.getTotalFila(item), 0);
    }

    // --- MÉTODOS DE FILTRADO Y BÚSQUEDA ---

    /** Filtra personal por cargo (ej. 'Gerente') */
    getByCargo(cargo: string): Data[] {
        return this.items.filter(item => 
            item.cargo.toLowerCase() === cargo.toLowerCase()
        );
    }

    /** Busca por nombre o DNI */
    buscar(termino: string): Data[] {
        const t = termino.toLowerCase();
        return this.items.filter(item => 
            item.nombre.toLowerCase().includes(t) || 
            item.dni.toString().includes(t)
        );
    }

    // --- UTILIDADES DE FORMATO ---

    /** Formatea un número a moneda local (PEN) */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    }
}
