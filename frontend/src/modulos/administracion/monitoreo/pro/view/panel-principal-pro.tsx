import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { SkeletonHeaderTable } from "#components/skeleton/SkeletonHeaderTable";
import { Button } from "#components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "#components/ui/dialog";
import { Plus } from "lucide-react";
import { useClientesShortList, useUbicacionesList } from "../../../lista/clientes/model/api/clientes-api";
import { useManagerDataPro } from "../hooks/use-manager-data-pro";
import { useProList } from "../model/api/pro-api";
import TablaMostrarRegistrosPro from "./tabla-pro";
import { ContentModal } from "../../weather/view/modal-general-consultas";
import { FormCreatePro } from "./form-create-pro";
import HistorialProMasivaExcel from "../ExampleCargaMasiva";
import { useToggle } from "#hooks/Toggle";



export function ShowPro(){

    const MostrarDialog = useToggle();

    const { data: apiData, isLoading, isError, error } = useProList();
    // --- 1. Carga de Listas Maestras ---
      const { data: UbicacionesList = [], isLoading: loadingUbicaciones } =
        useUbicacionesList();
      const { data: ClientesList = [], isLoading: loadingClientes } =
        useClientesShortList();
    
    // Consumimos nuestro hook customizado
    const { ProList } = useManagerDataPro(apiData);

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
                children={<FormCreatePro />}
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
          <HistorialProMasivaExcel
            open={MostrarDialog.isToggled}
            onClose={MostrarDialog.toggle}
          />
        </div>
      </header>
      <main className="">
        <div>
            {ProList.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
            <TablaMostrarRegistrosPro data={ProList} />
            )}
            {isError && <p>Error: {error.message}</p>}
        </div>
      </main>
    </div>
    );
}
