export interface DataTableCntsPorCobrar {
    key: number;
    id: number;
    fecha_emision: Date,
    fecha_vencimiento: Date,
    nro_documento: string,
    razon_social: string,
    total: number,
    moneda: string,
    tipo_cambio: number,
    fecha_pago: Date,
    monto_pagado: number,
    status_cobro: string,
    link_pdf: string,
}