export interface RowTableVentas {
  key: number;
  id: number;
  periodo: string;
  fecha_inicio: Date; 
  fecha_fin: Date;
  tipo_comp: string;
  serie_comp: string;
  numero_comp: string;
  tipo_empresa: string;
  numero_empresa: string;
  nombre_empresa: string;
  base_imponible: number;
  igv: number;
  total: number;
  moneda: string;
  tipo_cambio: number;
  categoria: string;
  descripcion: string | null;
  monto_retencion: number;
  monto_detraccion: number;
  is_active: string;
  link_pdf: string | null;
}