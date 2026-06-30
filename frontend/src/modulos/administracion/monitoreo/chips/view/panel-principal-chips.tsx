import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { SkeletonHeaderTable } from "#components/skeleton/SkeletonHeaderTable";
import { Button } from "#components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "#components/ui/dialog";
import { Cpu, Plus } from "lucide-react";
import { useManagerDataChips } from "../hooks/use-manager-data-chips";
import { useChipServicioList } from "../model/api/chips-api";
import TablaMostrarRegistrosChips from "./tabla-chips";
import {
  useClientesShortList,
  useUbicacionesList,
} from "../../../lista/clientes/model/api/clientes-api";
import { FormCreateChips } from "./form-create-chips";
import { ContentModal } from "../../weather/view/modal-general-consultas";
import { ShowChipsInventario } from "./panel-principal-chips-inventario";

export function ShowChips() {
  // Asumiendo que useWeatherList maneja un { data, isLoading }
  const { data: apiData, isLoading, isError, error } = useChipServicioList();

  const { data: UbicacionesList = [], isLoading: loadingUbicaciones } =
    useUbicacionesList();
  const { data: ClientesList = [], isLoading: loadingClientes } =
    useClientesShortList();

  // Consumimos nuestro hook customizado
  const { ChipsList } = useManagerDataChips(apiData);

  if (isLoading) return <SkeletonHeaderTable loading={isLoading} />;
  if (!apiData) return <ErrorResultServer />;
  return (
    <div className="h-full w-full space-y-1">
      <header className="flex items-center justify-between">
        <h1 className=" text-xs md:text-xl font-bold dark:text-mist-50">
          Registros de servicios Chips
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
                children={<FormCreateChips />}
                data_clientes={ClientesList}
                data_ubicaciones={UbicacionesList}
                loading_clientes={loadingClientes}
                loading_ubicaciones={loadingUbicaciones}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">
                <Cpu className="h-4 w-4" /> Lista de Inventario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[95vw] h-[90vh]">
              <ShowChipsInventario />
            </DialogContent>
          </Dialog> 
        </div>
      </header>
      <main className="">
        <div>
          {ChipsList.length === 0 ? (
            <p>No hay datos disponibles</p>
          ) : (
            <TablaMostrarRegistrosChips data={ChipsList} />
          )}
          {isError && <p>Error: {error.message}</p>}
        </div>
      </main>
    </div>
  );


}
