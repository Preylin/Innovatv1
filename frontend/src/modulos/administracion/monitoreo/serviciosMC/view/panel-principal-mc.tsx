import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { SkeletonHeaderTable } from "#components/skeleton/SkeletonHeaderTable";
import { Button } from "#components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "#components/ui/dialog";
import { useToggle } from "#hooks/Toggle";
import { Plus } from "lucide-react";
import { useManagerDataMC } from "../hooks/use-manager-data-mc";
import { useServiciosMCList } from "../model/api/mc-api";
import TablaMostrarRegistrosMC from "./tabla-mc";
import { ContentModal } from "../../weather/view/modal-general-consultas";
import { FormCreateMC } from "./form-create-mc";
import { useClientesShortList, useUbicacionesList } from "../../../lista/clientes/model/api/clientes-api";
import HistorialMcMasivaExcel from "../ModalImportacionMC";


export function ShowMC() {
    const MostrarDialog = useToggle();
    // Asumiendo que useWeatherList maneja un { data, isLoading }
    const { data: apiData, isLoading, isError, error } = useServiciosMCList();

    // --- 1. Carga de Listas Maestras ---
          const { data: UbicacionesList = [], isLoading: loadingUbicaciones } =
            useUbicacionesList();
          const { data: ClientesList = [], isLoading: loadingClientes } =
            useClientesShortList();
    
    // Consumimos nuestro hook customizado
    const { MCList } = useManagerDataMC(apiData);

    if (isLoading) return <SkeletonHeaderTable loading={isLoading} />;
    if (!apiData) return <ErrorResultServer />;
    return (
        <div className="h-full w-full space-y-1">
      <header className="flex items-center justify-between">
        <h1 className=" text-xs md:text-xl font-bold dark:text-mist-50">
          Registros de Servicios Weather
        </h1>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">
                <Plus /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[98vw] h-[90vh]">
              <ContentModal
                children={<FormCreateMC />}
                data_clientes={ClientesList}
                data_ubicaciones={UbicacionesList}
                loading_clientes={loadingClientes}
                loading_ubicaciones={loadingUbicaciones}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={MostrarDialog.toggle}
          >
            Importar
          </Button>
          <HistorialMcMasivaExcel
            open={MostrarDialog.isToggled}
            onClose={MostrarDialog.toggle}
          />
        </div>
      </header>
      <main className="">
        <div>
            {MCList.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
            <TablaMostrarRegistrosMC data={MCList} />
            )}
            {isError && <p>Error: {error.message}</p>}
        </div>
      </main>
    </div>
    );
}

        