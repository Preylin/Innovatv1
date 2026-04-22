interface BasePersonal {
  id: number;
  dni: string;
  nombre: string;
  cargo: string;
  fecha_ingreso: string;
  rem_basico: number;
  grati: number;
  cts: number;
  vacacion: number;
}

export interface DataCruda extends BasePersonal {
  asig_familiar: number;
}
export interface Data extends BasePersonal {
  asig_familiar: number;
  rem_total: number;
  soles: number;
  dolares: number;
}
