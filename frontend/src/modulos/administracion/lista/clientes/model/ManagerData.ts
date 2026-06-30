

export interface ClientesManagerData {
  key: number;
  id: number;
  nro_documento: string;
  razon_social: string;
}

export class ClientesManager {
  private data: ClientesManagerData[] = [];

  constructor(initialData: ClientesManagerData[]) {
    this.data = initialData;
  }

  // Funciones síncronas para evitar lidiar con Promesas en el renderizado
  getData(): ClientesManagerData[] {
    return this.data;
  }

  getDataById(id: number): ClientesManagerData | undefined {
    return this.data.find((d) => d.id === id);
  }

  createData(newItem: ClientesManagerData): void {
    this.data.push(newItem);
  }

  updateData(id: number, updatedItem: ClientesManagerData): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data[index] = updatedItem;
    }
  }
  deleteData(id: number): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}


export interface UbicacionesManagerData {
  key: number;
  id: number;
  ubicacion: string;
}

export class UbicacionesManager {
  private data: UbicacionesManagerData[] = [];

  constructor(initialData: UbicacionesManagerData[]) {
    this.data = initialData;
  }

  // Funciones síncronas para evitar lidiar con Promesas en el renderizado
  getData(): UbicacionesManagerData[] {
    return this.data;
  }

  getDataById(id: number): UbicacionesManagerData | undefined {
    return this.data.find((d) => d.id === id);
  }

  createData(newItem: UbicacionesManagerData): void {
    this.data.push(newItem);
  }

  updateData(id: number, updatedItem: UbicacionesManagerData): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data[index] = updatedItem;
    }
  }
  deleteData(id: number): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}

export interface ProveedoresManagerData {
  key: number;
  id: number;
  nro_documento: string;
  razon_social: string;
}

export class ProveedoresManager {
  private data: ProveedoresManagerData[] = [];

  constructor(initialData: ProveedoresManagerData[]) {
    this.data = initialData;
  }

  // Funciones síncronas para evitar lidiar con Promesas en el renderizado
  getData(): ProveedoresManagerData[] {
    return this.data;
  }

  getDataById(id: number): ProveedoresManagerData | undefined {
    return this.data.find((d) => d.id === id);
  }

  createData(newItem: ProveedoresManagerData): void {
    this.data.push(newItem);
  }

  updateData(id: number, updatedItem: ProveedoresManagerData): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data[index] = updatedItem;
    }
  }
  deleteData(id: number): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}