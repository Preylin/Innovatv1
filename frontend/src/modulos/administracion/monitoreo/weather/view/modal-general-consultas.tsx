import { useState, useMemo } from "react";
import { Button } from "#components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog";
import { Input } from "#components/ui/input";
import { Badge } from "#components/ui/badge";
import {
  CloudSun,
  Cpu,
  FileSpreadsheet,
  Layers,
  Search,
  Calendar,
  User,
  Wrench,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useExportChipsMasiva,
  useExportMCMasiva,
  useExportProMasiva,
  useExportWeatherMasiva,
} from "../model/api/weather-api";

import type {
  ClienteOutShortApiType,
  UbicacionOutApiType,
} from "../../../lista/clientes/model/api/clientes-schema-api";
import type {
  ChipsMasivaApiType,
  MCMasivaApiType,
  ProMasivaApiType,
  WeatherMasivaApiType,
} from "../model/api/weather-schema-api";
import { ScrollArea } from "#components/ui/scroll-area";
import { CustomCombobox } from "#components/ui/input-search-new-custom";

// --- Interfaces de Tipado ---
interface WeatherItem {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  fact_relacionada?: string;
  estado?: string;
  adicional?: string;
  dias_counter?: number | null;
}
interface ProItem {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  fact_relacionada?: string;
  estado?: string;
  adicional?: string;
  dias_counter?: number | null;
}
interface MCItem {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  fact_relacionada?: string;
  informe?: string;
  certificado?: string;
  encargado?: string;
  tecnico?: string;
  servicio?: string;
  incidencia?: string;
  estado?: string;
  dias_counter?: number | null;
}
interface ChipsItem {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero_chip: string;
  fact_relacionada?: string;
  estado?: string;
  adicional?: string;
  dias_counter?: number | null;
}
interface UbicacionItem {
  id: number;
  ubicacion: string;
}
interface ClienteItem {
  id: number;
  nro_documento: string;
  razon_social: string;
}

type ComboboxOption = {
  value: string; // ID en string para el componente Combobox
  label: string; // Texto a mostrar
};

const formatDate = (date: string | Date | null) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("es-PE", { timeZone: "UTC" });
};

const CalcularDiasVencimiento = (
  fecha1: string,
  estado: string,
): number | null => {
  if (!fecha1) return null;
  if (estado === "PENDIENTE") {
    const d1 = new Date(fecha1);
    const d2 = new Date();
    const dias = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
    return Math.floor(dias + 1); // +1 para incluir el día actual
  }
  return null;
};

const mapWeather = (item: WeatherMasivaApiType[]): WeatherItem[] => {
  return item.map((item) => {
    return {
      id: item.id,
      fecha_inicio: formatDate(item.fecha_inicio),
      fecha_fin: formatDate(item.fecha_fin),
      fact_relacionada: item.fact_relacionada || "",
      estado: item.estado || "",
      adicional: item.adicional || "",
      dias_counter: CalcularDiasVencimiento(item.fecha_fin, item.estado || ""),
    };
  });
};

const mapPro = (item: ProMasivaApiType[]): ProItem[] => {
  return item.map((item) => {
    return {
      id: item.id,
      fecha_inicio: formatDate(item.fecha_inicio),
      fecha_fin: formatDate(item.fecha_fin),
      fact_relacionada: item.fact_relacionada || "",
      estado: item.estado || "",
      adicional: item.adicional || "",
      dias_counter: CalcularDiasVencimiento(item.fecha_fin, item.estado || ""),
    };
  });
};

const mapMC = (item: MCMasivaApiType[]): MCItem[] => {
  return item.map((item) => {
    return {
      id: item.id,
      fecha_inicio: formatDate(item.fecha_inicio),
      fecha_fin: formatDate(item.fecha_fin),
      fact_relacionada: item.fact_relacionada || "",
      informe: item.informe || "",
      certificado: item.certificado || "",
      encargado: item.encargado || "",
      tecnico: item.tecnico || "",
      servicio: item.servicio || "",
      incidencia: item.incidencia || "",
      estado: item.estado || "",
      dias_counter: CalcularDiasVencimiento(item.fecha_fin, item.estado || ""),
    };
  });
};

const mapChips = (item: ChipsMasivaApiType[]): ChipsItem[] => {
  return item.map((item) => {
    return {
      id: item.id,
      fecha_inicio: formatDate(item.fecha_inicio),
      fecha_fin: formatDate(item.fecha_fin),
      numero_chip: item.numero_chip,
      fact_relacionada: item.fact_relacionada || "",
      estado: item.estado || "",
      adicional: item.adicional || "",
      dias_counter: CalcularDiasVencimiento(item.fecha_fin, item.estado || ""),
    };
  });
};

interface PropsComponent {
  data_clientes: ClienteOutShortApiType[];
  loading_clientes: boolean;
  loading_ubicaciones: boolean;
  data_ubicaciones: UbicacionOutApiType[];
  children: React.ReactNode;
}

export function ContentModal({
  children,
  data_clientes,
  data_ubicaciones,
  loading_clientes,
  loading_ubicaciones,
}: PropsComponent) {
  const [query, setQuery] = useState("");

  const ClientesList = data_clientes;
  const UbicacionesList = data_ubicaciones;
  const loadingClientes = loading_clientes;
  const loadingUbicaciones = loading_ubicaciones;

  // --- 2. Estados de Selección Temporal (Comboboxes) ---
  const [selectedCliente, setSelectedCliente] = useState<ComboboxOption | null>(
    null,
  );
  const [selectedUbicacion, setSelectedUbicacion] =
    useState<ComboboxOption | null>(null);

  // --- 3. Estados Definitivos para la Búsqueda (API) ---
  const [searchParams, setSearchParams] = useState<{
    clienteId: number;
    ubicacionId: number;
  } | null>(null);

  // Transformación de opciones para los Comboboxes
  const clientes = useMemo(() => {
    return ClientesList.map((cl: ClienteItem) => ({
      value: String(cl.id),
      label: cl.razon_social,
    }));
  }, [ClientesList]);

  const ubicaciones = useMemo(() => {
    return UbicacionesList.map((ub: UbicacionItem) => ({
      value: String(ub.id),
      label: ub.ubicacion,
    }));
  }, [UbicacionesList]);

  // --- 4. Llamadas a las APIs (Usando los parámetros confirmados) ---
  // Pasamos 0 o null si searchParams es null, controlando internamente que no dispare búsquedas vacías si tu backend lo requiere
  const activeClienteId = searchParams?.clienteId;
  const activeUbicacionId = searchParams?.ubicacionId;

  // Pasamos los IDs directamente.
  // Nota: Si tus hooks aceptan un tercer parámetro de opciones de useQuery, agrégale { enabled: !!activeClienteId }
  const { data: weather = [], isLoading: loadingWeather } =
    useExportWeatherMasiva(activeClienteId ?? -1, activeUbicacionId ?? -1);

  const { data: pro = [], isLoading: loadingPro } = useExportProMasiva(
    activeClienteId ?? -1,
    activeUbicacionId ?? -1,
  );

  const { data: mc = [], isLoading: loadingMc } = useExportMCMasiva(
    activeClienteId ?? -1,
    activeUbicacionId ?? -1,
  );

  const { data: chips = [], isLoading: loadingChips } = useExportChipsMasiva(
    activeClienteId ?? -1,
    activeUbicacionId ?? -1,
  );

  const dataWeaMaker = useMemo(() => {
    if (!weather) return [];
    return mapWeather(weather);
  }, [weather]);

  const dataProMaker = useMemo(() => {
    if (!pro) return [];
    return mapPro(pro);
  }, [pro]);

  const dataMCMaker = useMemo(() => {
    if (!mc) return [];
    return mapMC(mc);
  }, [mc]);

  const dataChipsMaker = useMemo(() => {
    if (!chips) return [];
    return mapChips(chips);
  }, [chips]);

  // --- 5. Manejador del Click de Búsqueda ---
  const handleExecuteSearch = () => {
    if (selectedCliente && selectedUbicacion) {
      setSearchParams({
        clienteId: Number(selectedCliente.value),
        ubicacionId: Number(selectedUbicacion.value),
      });
    }
  };

  // --- 6. Filtro en Tiempo Real ---
  const filterData = <T extends object>(data: T[], searchTerm: string): T[] => {
    const normalizedTerm = searchTerm.toLowerCase().trim();
    if (!normalizedTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(normalizedTerm),
      ),
    );
  };

  const filteredData = useMemo(() => {
    return {
      weather: filterData(dataWeaMaker, query),
      pro: filterData(dataProMaker, query),
      mc: filterData(dataMCMaker, query),
      chips: filterData(dataChipsMaker, query),
    };
  }, [query, weather, pro, mc, chips]);

  const renderStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">N/A</Badge>;

    const normalized = status.toLowerCase().trim();
    if (normalized === "renovado") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/30 text-[10px]">
          {status}
        </Badge>
      );
    }
    if (normalized === "pendiente") {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200/30 text-[10px]">
          {status}
        </Badge>
      );
    }
    if (normalized === "no renovado") {
      return (
        <Badge variant="destructive" className="text-[10px]">
          {status}
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    // Contenedor principal para estructurar la altura de forma fluida y elástica
    <div className="flex flex-col h-full max-h-[85vh] space-y-4">
      {/* 1. DIALOG HEADER: Únicamente títulos y descripciones semánticas */}
      <DialogHeader className="space-y-1.5 shrink-0">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Servicios
        </DialogTitle>
        <DialogDescription>
          Consulte, filtre y registre nuevos servicios.
        </DialogDescription>
      </DialogHeader>

      <main className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        <section className="w-full lg:w-3/4">
          {/* 2. FORMULARIO DE FILTROS: Fuera del header, actúa como la sección superior del cuerpo */}
          <div className="space-y-4 pb-4 border-b shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 col-span-3 w-full">
                {/* Combobox de Clientes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Cliente
                  </label>
                  <CustomCombobox
                    items={clientes}
                    value={selectedCliente}
                    onValueChange={setSelectedCliente}
                    placeholder={
                      loadingClientes
                        ? "Cargando clientes..."
                        : "Buscar cliente..."
                    }
                    emptyText="No se encontraron clientes."
                  />
                </div>

                {/* Combobox de Ubicaciones */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <CustomCombobox
                    items={ubicaciones}
                    value={selectedUbicacion}
                    onValueChange={setSelectedUbicacion}
                    placeholder={
                      loadingUbicaciones
                        ? "Cargando..."
                        : "Selecciona una ubicación..."
                    }
                    disabled={loadingUbicaciones}
                    emptyText="No se encontraron ubicaciones."
                  />
                </div>
              </div>

              {/* Botón de Ejecutar Búsqueda */}
              <Button
                onClick={handleExecuteSearch}
                disabled={!selectedCliente || !selectedUbicacion}
                className=""
              >
                <RefreshCw className="h-4 w-4" /> Buscar
              </Button>
            </div>

            {/* Buscador Integrado en Tiempo Real */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-background/50 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* 3. CONTENEDOR DE RESULTADOS: Ocupa de forma dinámica todo el alto restante de la pantalla */}
          <div className="flex-1 min-h-0 py-2 ">
            {!searchParams && (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/30 text-center my-auto min-h-62.5">
                <AlertCircle className="h-8 w-8 text-muted-foreground/70 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">
                  No se han seleccionado parámetros
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                  Utilice los autocompletados de la parte superior para
                  seleccionar un cliente y ubicación válidos, y presione "Buscar
                  Historial".
                </p>
              </div>
            )}

            {searchParams && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-1 items-start">
                {/* Columna Weather */}
                <div className="space-y-3 overflow-auto scroll-auto">
                  <div className="flex items-center justify-between border-b pb-2 font-semibold text-sm text-foreground/80">
                    <span className="flex items-center gap-2">
                      <CloudSun className="h-4 w-4 text-muted-foreground" />{" "}
                      Weather
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {filteredData.weather.length}
                    </Badge>
                  </div>
                  <ScrollArea className="overflow-auto scroll-auto max-h-[calc(100vh-425px)]">
                    <DataGridSection
                      isLoading={loadingWeather}
                      items={filteredData.weather}
                      title="Weather"
                    >
                      {(item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border bg-card/50 space-y-2 hover:bg-card transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Desde{" "}
                                <span className="text-foreground">
                                  {item.fecha_inicio}
                                </span>{" "}
                                hasta{" "}
                                <span className="text-foreground">
                                  {item.fecha_fin}
                                </span>
                              </div>
                            </div>
                            {renderStatusBadge(item.estado)}
                          </div>
                          <div className="text-xs space-y-1 pt-1 border-t border-dashed">
                            <div className="flex justify-between">
                              <p>
                                <span className="font-medium text-foreground">
                                  Factura:
                                </span>{" "}
                                {item.fact_relacionada}
                              </p>
                              {item.dias_counter && (
                                <Badge
                                  className={`text-[10px] ${
                                    item.dias_counter < 0
                                      ? "bg-red-200 text-red-800"
                                      : "bg-taupe-100 text-taupe-800"
                                  }`}
                                >
                                  {item.dias_counter} días
                                </Badge>
                              )}
                            </div>
                            {item.adicional && (
                              <p className="text-muted-foreground italic">
                                "{item.adicional}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </DataGridSection>
                  </ScrollArea>
                </div>

                {/* Columna Pro */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 font-semibold text-sm text-foreground/80">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" /> Pro
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {filteredData.pro.length}
                    </Badge>
                  </div>
                  <ScrollArea className="overflow-auto scroll-auto max-h-[calc(100vh-425px)]">
                    <DataGridSection
                      isLoading={loadingPro}
                      items={filteredData.pro}
                      title="Pro"
                    >
                      {(item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border bg-card/50 space-y-2 hover:bg-card transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Desde{" "}
                                <span className="text-foreground">
                                  {item.fecha_inicio}
                                </span>{" "}
                                hasta{" "}
                                <span className="text-foreground">
                                  {item.fecha_fin}
                                </span>
                              </div>
                            </div>
                            {renderStatusBadge(item.estado)}
                          </div>
                          <div className="text-xs space-y-1 pt-1 border-t border-dashed">
                            <div className="flex justify-between">
                              <p>
                                <span className="font-medium text-foreground">
                                  Factura:
                                </span>{" "}
                                {item.fact_relacionada}
                              </p>
                              {item.dias_counter && (
                                <Badge
                                  className={`text-[10px] ${
                                    item.dias_counter < 0
                                      ? "bg-red-200 text-red-800"
                                      : "bg-taupe-100 text-taupe-800"
                                  }`}
                                >
                                  {item.dias_counter} días
                                </Badge>
                              )}
                            </div>
                            {item.adicional && (
                              <p className="text-muted-foreground italic">
                                "{item.adicional}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </DataGridSection>
                  </ScrollArea>
                </div>

                {/* Columna MC */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 font-semibold text-sm text-foreground/80">
                    <span className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" /> MC
                    </span>
                    <Badge variant="outline" className="text-[10px] ">
                      {filteredData.mc.length}
                    </Badge>
                  </div>
                  <ScrollArea className="overflow-auto scroll-auto max-h-[calc(100vh-425px)]">
                    <DataGridSection
                      isLoading={loadingMc}
                      items={filteredData.mc}
                      title="Mantenimiento Certificado"
                    >
                      {(item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border bg-card/50 space-y-2 hover:bg-card transition-colors"
                        >
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                              {item.servicio}
                            </span>
                            {renderStatusBadge(item.estado)}
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground pt-1.5">
                            <div className="col-span-2 flex items-center gap-1 w-full justify-between">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Desde{" "}
                                <span className="text-foreground">
                                  {item.fecha_inicio}
                                </span>{" "}
                                hasta{" "}
                                <span className="text-foreground">
                                  {item.fecha_fin}
                                </span>
                              </div>
                              {item.dias_counter && (
                                <Badge
                                  className={`text-[10px] ${
                                    item.dias_counter < 0
                                      ? "bg-red-200 text-red-800"
                                      : "bg-taupe-100 text-taupe-800"
                                  }`}
                                >
                                  {item.dias_counter} días
                                </Badge>
                              )}
                            </div>

                            {item.informe && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Informe:
                                </span>{" "}
                                {item.informe}
                              </p>
                            )}
                            {item.certificado && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Certificado:
                                </span>{" "}
                                {item.certificado}
                              </p>
                            )}
                            {item.fact_relacionada && (
                              <p className="col-span-2 flex items-center gap-1">
                                <User className="h-3 w-3" /> Fact:{" "}
                                {item.encargado}
                              </p>
                            )}
                            {item.encargado && (
                              <p className="col-span-2 flex items-center gap-1">
                                <User className="h-3 w-3" /> Encargado:{" "}
                                {item.encargado}
                              </p>
                            )}
                            {item.tecnico && (
                              <p className="col-span-2 flex items-center gap-1">
                                <User className="h-3 w-3" /> Técnico:{" "}
                                {item.tecnico}
                              </p>
                            )}
                          </div>
                          {item.incidencia && (
                            <p className="text-[11px] bg-destructive/5 text-destructive/90 rounded p-1.5 mt-1 border border-destructive/10">
                              <span className="font-semibold">Incidencia:</span>{" "}
                              {item.incidencia}
                            </p>
                          )}
                        </div>
                      )}
                    </DataGridSection>
                  </ScrollArea>
                </div>

                {/* Columna Chips */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 font-semibold text-sm text-foreground/80">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" /> Chips
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {filteredData.chips.length}
                    </Badge>
                  </div>
                  <ScrollArea className="overflow-auto scroll-auto max-h-[calc(100vh-425px)]">
                    <DataGridSection
                      isLoading={loadingChips}
                      items={filteredData.chips}
                      title="Chips"
                    >
                      {(item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border bg-card/50 space-y-2 hover:bg-card transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Desde{" "}
                                <span className="text-foreground">
                                  {item.fecha_inicio}
                                </span>{" "}
                                hasta{" "}
                                <span className="text-foreground">
                                  {item.fecha_fin}
                                </span>
                              </div>
                            </div>
                            {renderStatusBadge(item.estado)}
                          </div>
                          <div className="text-xs space-y-1 pt-1 border-t border-dashed">
                            <div className="flex justify-between">
                              <p>
                                <span className="font-medium text-foreground">
                                  Factura:
                                </span>{" "}
                                {item.fact_relacionada}
                              </p>
                              {item.dias_counter && (
                                <Badge
                                  className={`text-[10px] ${
                                    item.dias_counter < 0
                                      ? "bg-red-200 text-red-800"
                                      : "bg-taupe-100 text-taupe-800"
                                  }`}
                                >
                                  {item.dias_counter} días
                                </Badge>
                              )}
                            </div>
                            {item.adicional && (
                              <p className="text-muted-foreground italic">
                                "{item.adicional}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </DataGridSection>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </section>
        <section className=" w-full lg:w-1/4 flex justify-center">
          {children}
        </section>
      </main>
    </div>
  );
}

// --- Componente de Sección Auxiliar ---
interface DataGridSectionProps<T> {
  title: string;
  isLoading: boolean;
  items: T[];
  children: (item: T) => React.ReactNode;
}

function DataGridSection<T>({
  title,
  isLoading,
  items,
  children,
}: DataGridSectionProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-28 rounded-xl border bg-muted/20 animate-pulse flex flex-col justify-between p-3.5"
          >
            <div className="flex justify-between items-center w-full">
              <div className="h-3.5 w-1/3 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-muted/10 px-2">
        <AlertCircle className="h-6 w-6 text-muted-foreground/60 stroke-[1.5]" />
        <p className="mt-1.5 text-xs font-medium">Sin resultados</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          No hay elementos en {title}.
        </p>
      </div>
    );
  }

  return <div className="space-y-3">{items.map(children)}</div>;
}
