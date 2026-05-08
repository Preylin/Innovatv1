import { Button, Dropdown, Empty, Popconfirm, type MenuProps } from "antd";
import { dataActivosPersonal } from "../api/personal/data";
import { usePersonalData } from "../hooks/dataMemoPersonal";
import { ModalCrearPersonalActivo } from "./personal/modalCrearPersonal";
import { useToggle, useUpdateModal } from "../../../../hooks/Toggle";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import { ModalEditarPersonalActivo } from "./personal/modalUpdatePersonal";
import { BiDotsVerticalRounded } from "react-icons/bi";

interface Header {
  id: number;
  header: string;
}
export const datoHeader: Header[] = [
  { id: 1, header: "Nro" },
  { id: 2, header: "DNI" },
  { id: 3, header: "Nombre" },
  { id: 4, header: "Cargo" },
  { id: 5, header: "Fecha Ingreso" },
  { id: 6, header: "Rem. Basico" },
  { id: 7, header: "Asig. Familiar" },
  { id: 8, header: "Total" },
  { id: 9, header: "Gratificaciones" },
  { id: 10, header: "CTS" },
  { id: 11, header: "Vacaciones" },
  { id: 12, header: "Soles" },
  { id: 13, header: "Dólares" },
  { id: 14, header: "Acciones" },
];

const DatoTabla = ({ dato }: { dato: string | number }) => {
  if (typeof dato === "number") {
    return (
      <td className="text-center text-xs md:text-sm truncate hover:bg-yellow-500/60">
        {dato.toLocaleString("en-US")}
      </td>
    );
  } else {
    return (
      <td className="text-center text-xs md:text-sm pl-2 truncate">{dato}</td>
    );
  }
};

export default function TablaActivosPersonal() {
  const { data, totales } = usePersonalData(dataActivosPersonal);
  const numColumnas = datoHeader.length;

  const ModalCrear = useToggle();
  const ModalEditar = useUpdateModal();

  const getMenuItems = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      label: <ButtonUpdate onClick={() => ModalEditar.handlerOpen(id)} />,
    },
    {
      key: "delete",
      label: (
        <div>
          <Popconfirm
            title="¿Eliminar registro?"
            description="Esta acción no se puede deshacer"
            // onConfirm={() =>
            //   mutate(id, {
            //     onSuccess: () => message.success("Registro eliminado"),
            //     onError: (err) => message.error(err.message),
            //   })
            // }
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <ButtonDelete style={{ margin: "0px" }} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-1 dark:bg-mist-200 w-full overflow-auto scroll-auto rounded-sm shadow-md dark:shadow-mist-100/50 p-1">
      <div className="flex flex-row w-full justify-between">
        <h1 className="text-base md:text-xl font-bold pl-1 select-none">
          Mano de Obra
        </h1>
        <Button type="primary" onClick={ModalCrear.toggle}>
          Crear Personal
        </Button>
      </div>
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
                  <DatoTabla dato={item.dni} />
                  <DatoTabla dato={item.nombre} />
                  <DatoTabla dato={item.cargo} />
                  <DatoTabla dato={item.fecha_ingreso} />
                  <DatoTabla dato={item.rem_basico} />
                  <DatoTabla dato={item.asig_familiar} />
                  <DatoTabla dato={item.rem_total} />
                  <DatoTabla dato={item.grati} />
                  <DatoTabla dato={item.cts} />
                  <DatoTabla dato={item.vacacion} />
                  <DatoTabla dato={item.soles} />
                  <DatoTabla dato={item.dolares} />
                  <td className="flex justify-center">
                    <Dropdown
                      menu={{ items: getMenuItems(item.id) }}
                      trigger={["click"]}
                      placement="bottom"
                      styles={{ item: { padding: "3px 0px" } }}
                    >
                      <div className="w-6 h-5 flex justify-center items-center border rounded-xs bg-mist-600 hover:bg-mist-500 cursor-pointer">
                        <BiDotsVerticalRounded className="text-white" />
                      </div>
                    </Dropdown>
                  </td>
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
              <td colSpan={5} className="text-center">
                TOTAL
              </td>
              <DatoTabla dato={totales.sueldos} />
              <DatoTabla dato={totales.asig} />
              <DatoTabla dato={totales.remTotal} />
              <DatoTabla dato={totales.grati} />
              <DatoTabla dato={totales.cts} />
              <DatoTabla dato={totales.vacacion} />
              <DatoTabla dato={totales.soles} />
              <DatoTabla dato={totales.dolares} />
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      {ModalCrear.isToggled && (
        <ModalCrearPersonalActivo
          open={ModalCrear.isToggled}
          onClose={ModalCrear.toggle}
        />
      )}
      {ModalEditar.data !== null && (
        <ModalEditarPersonalActivo
          id={ModalEditar.data as number}
          open={ModalEditar.isToggled}
          onClose={() => ModalEditar.handlerClose()}
        />
      )}
    </div>
  );
}
