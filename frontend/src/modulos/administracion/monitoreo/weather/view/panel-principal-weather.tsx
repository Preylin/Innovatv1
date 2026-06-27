import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { SkeletonHeaderTable } from "#components/skeleton/SkeletonHeaderTable";
import { Button } from "#components/ui/button";
import { useToggle } from "#hooks/Toggle";
import { Plus } from "lucide-react";
import { useManagerDataWeather } from "../hooks/use-manager-data-weather";
import { useWeatherList } from "../model/api/weather-api";
import TablaMostrarRegistrosWather from "./tabla-weather";
import HistorialWeatherMasivaExcel from "../../ExampleCargaMasiva";
import { Dialog, DialogContent, DialogTrigger } from "#components/ui/dialog";
import { ContentModal } from "./modal-general-consultas";
import { FormCreateWeather } from "./form-create-weather";
import {
  useClientesShortList,
  useUbicacionesList,
} from "../../../lista/clientes/model/api/clientes-api";

export function ShowWeather() {
  // Asumiendo que useWeatherList maneja un { data, isLoading }
  const { data: apiData, isLoading, isError, error } = useWeatherList();
  // --- 1. Carga de Listas Maestras ---
  const { data: UbicacionesList = [], isLoading: loadingUbicaciones } =
    useUbicacionesList();
  const { data: ClientesList = [], isLoading: loadingClientes } =
    useClientesShortList();

  // Consumimos nuestro hook customizado
  const { weatherList } = useManagerDataWeather(apiData);
  const MostrarDialog = useToggle();

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
                children={<FormCreateWeather />}
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
          <HistorialWeatherMasivaExcel
            open={MostrarDialog.isToggled}
            onClose={MostrarDialog.toggle}
          />
        </div>
      </header>
      <main className="">
        <div>
          {weatherList.length === 0 ? (
            <p>No hay datos disponibles</p>
          ) : (
            <TablaMostrarRegistrosWather data={weatherList} />
          )}
          {isError && <p>Error: {error.message}</p>}
        </div>
      </main>
    </div>
  );
}
