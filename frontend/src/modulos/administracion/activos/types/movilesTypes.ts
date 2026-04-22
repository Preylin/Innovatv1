interface BaseVehiculo {
    id: number;
    placa: string;
    nombre: string;
    fecha_compra: string;
    valor: number;
    aseguradora: string;
    años_utiles: number;
}

export interface DataCruda extends BaseVehiculo {
    monto_depresiado: number;
}

export interface Data extends BaseVehiculo {
    monto_depresiado: number;
    montoPorDepreciar: number;
}