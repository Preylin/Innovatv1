class DataChangeManagerVentas<T extends { id: number | string }> {
  private originalData: Map<string | number, T> = new Map();
  private changes: Map<string | number, { type: 'UPDATE' | 'NEW'; data: T }> = new Map();

  // Cambiamos el tipo del parámetro del constructor a 'any[]' o un tipo parcial
  constructor(initialData: any[]) {
    initialData.forEach(item => {
      // Inyectamos un saldo de 0 por defecto para cumplir con la interfaz Row
      const rowWithSaldo = { ...item, saldo: item.saldo ?? 0 } as T;
      this.originalData.set(item.id, rowWithSaldo);
    });
  }

  registerChange(id: string | number, data: T, isNew: boolean = false) {
    this.changes.set(id, {
      type: isNew ? 'NEW' : 'UPDATE',
      data: { ...data }
    });
  }

  getPendingPayload() {
    const updates: T[] = [];
    const created: T[] = [];

    this.changes.forEach((change) => {
        // Extraemos 'saldo' para que NO se incluya en la data enviada
        const { saldo, ...dataWithoutSaldo } = change.data as any;
        
        if (change.type === 'NEW') {
            created.push(dataWithoutSaldo);
        } else {
            updates.push(dataWithoutSaldo);
        }
    });

    return { updates, created };
}

  hasChanges(): boolean { return this.changes.size > 0; }
  clear() { this.changes.clear(); }
}

export default DataChangeManagerVentas;