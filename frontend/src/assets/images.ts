// assets/images.ts mapea las imagenes de la carpeta assets y permite exportarlos y usarlos en el proyecto
import gerenciaImg from "../assets/inicio/gerencia.png";
import administracionImg from "../assets/inicio/administracion.png";
import contabilidadImg from "../assets/inicio/contabilidad.png";
import tesoreriaImg from "../assets/inicio/tesoreria.png";
import rrhhImg from "../assets/inicio/rrhh.png";
import ventasImg from "../assets/inicio/ventas.png";
import almacenImg from "../assets/inicio/almacen.png";
import produccionImg from "../assets/inicio/produccion.png";
import innovathomeImg from "../assets/inicio/innovathome.webp";
import imagenDefault from "../assets/imagenDefault.jpg"


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
export const defaultImage = imagenDefault
