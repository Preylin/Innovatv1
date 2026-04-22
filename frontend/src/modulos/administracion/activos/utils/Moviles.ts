import type { Data } from "../types/movilesTypes";

export class Moviles {
    private items: Data[];

    constructor(items: Data[]) {
        // Al trabajar con APIs, la instancia recibe los datos frescos
        this.items = items;
    }

    // --- MÉTODOS DE ACCESO ---
    
    getAll(): Data[] {
        return this.items;
    }

    getById(id: number): Data | undefined {
        return this.items.find(item => item.id === id);
    }

    // --- MÉTODOS DE AGREGACIÓN (TOTALES DE COLUMNA) ---

    /** Suma cualquier columna numérica del array actual */
    sumarColumna(columna: keyof Data): number {
        return this.items.reduce((acc, item) => {
            const value = item[columna];
            return typeof value === 'number' ? acc + value : acc;
        }, 0);
    }

    
}
