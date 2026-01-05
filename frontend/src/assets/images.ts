// assets/images.ts mapea las imagenes de la carpeta assets y permite exportarlos y usarlos en el proyecto
import gerenciaImg from "../assets/inicio/gerencia.svg";
import administracionImg from "../assets/inicio/administracion.svg";
import contabilidadImg from "../assets/inicio/contabilidad.webp";
import tesoreriaImg from "../assets/inicio/tesoreria.png";
import rrhhImg from "../assets/inicio/rrhh.svg";
import ventasImg from "../assets/inicio/ventas.png";
import almacenImg from "../assets/inicio/almacen.svg";
import produccionImg from "../assets/inicio/produccion.png";
import innovathomeImg from "../assets/inicio/innovathome.webp";


export const ImagesHome: Record<string, string>= {
  gerencia: gerenciaImg,
  administracion: administracionImg,
  contabilidad: contabilidadImg,
  tesoreria: tesoreriaImg,
  rrhh: rrhhImg,
  ventas: ventasImg,
  almacen: almacenImg,
  produccion: produccionImg,
} as const;

export const logo = innovathomeImg