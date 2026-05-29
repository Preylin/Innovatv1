export interface RowTableCompras {
  key: number;
  id: number;
  periodo: string;
  fecha_inicio: string; 
  fecha_fin: string;
  tipo_comp: string;
  serie_comp: string;
  numero_comp: string;
  tipo_empresa: string;
  numero_empresa: string;
  nombre_empresa: string;
  base_imponible: number;
  igv: number;
  no_gravadas: number;
  otros: number;
  total: number;
  moneda: string;
  tipo_cambio: number;
  descripcion: string | null;
  is_active: string;
  link_pdf: string | null;
}