import { Empty } from "antd";
import { useDispositivosData } from "../hooks/useMemoDispositivos";
import { dataActivosDispositivos } from "../api/dispositivos/data";

interface Header {
  id: number;
  header: string;
}
export const datoHeader: Header[] = [
  { id: 1, header: "Nro" },
  { id: 2, header: "SERIE" },
  { id: 3, header: "NOMBRE" },
  { id: 4, header: "FECHA DE ADQUISICIÓN" },
  { id: 5, header: "VALOR" },
  { id: 6, header: "MONTO DEPRECIADO" },
  { id: 7, header: "MONTO POR DEPRECIAR" },
  { id: 8, header: "ACCIONES" },
];

const DatoTabla = ({ dato }: { dato: string | number }) => {
  if (typeof dato === "number") {
    return (
      <td className="text-center text-xs md:text-sm truncate">
        {dato.toLocaleString("en-US")}
      </td>
    );
  } else {
    return (
      <td className="text-center text-xs md:text-sm pl-2 truncate">{dato}</td>
    );
  }
};

export default function TablaActivosDispositivos() {
  // Obtenemos todo del hook
  const { data, totales } = useDispositivosData(dataActivosDispositivos);
  const numColumnas = datoHeader.length;

  return (
    <div className="flex flex-col gap-1 dark:bg-mist-200 w-full overflow-auto scroll-auto rounded-sm shadow-md px-1 pb-1">
      <div><h1 className="text-base md:text-xl font-bold pl-1 select-none">Dispositivos y otros</h1></div>
      <div className="overflow-auto scroll-auto w-full">
        <table className="table-auto border-separate border-spacing-0.5 w-full">
        <thead className="bg-mist-700">
          <tr>
            {datoHeader.map((item) => (
              <th
                key={item.id}
                className="text-xs md:text-sm text-center font-bold px-2 py-0.5 text-white truncate select-none"
              >
                {item.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-mist-300">
                <td className="text-center">{index + 1}</td>
                <DatoTabla dato={item.serie} />
                <DatoTabla dato={item.nombre} />
                <DatoTabla dato={item.fecha_compra} />
                <DatoTabla dato={item.valor} />
                <DatoTabla dato={item.monto_depresiado} />
                <DatoTabla dato={item.montoPorDepreciar} />
              </tr>
            ))
          ) : (
            /* Caso cuando NO hay registros */
            <tr>
              <td colSpan={numColumnas} className="py-10">
                <Empty description="No hay registros" />
              </td>
            </tr>
          )}
          {/* Fila de Totales */}
          <tr className="bg-mist-400 font-semibold">
            <td colSpan={4} className="text-center">
              TOTAL
            </td>
            <DatoTabla dato={totales.valores} />
            <DatoTabla dato={totales.depreciado} />
            <DatoTabla dato={totales.depreciar} />
            <td></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
