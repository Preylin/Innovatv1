interface BaseDispositivo {
    id: number;
    serie: string;
    nombre: string;
    fecha_compra: string;
    valor: number;
}

export interface DataCruda extends BaseDispositivo {
    monto_depresiado: number;
}

export interface Data extends BaseDispositivo {
    monto_depresiado: number;
    montoPorDepreciar: number;
}