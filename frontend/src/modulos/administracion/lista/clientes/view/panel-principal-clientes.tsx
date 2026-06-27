import { useState, useMemo } from "react";
import { Input } from "#components/ui/input";
import { Card, CardContent } from "#components/ui/card";
import {
  Search,
  Inbox,
  Building2,
  IdCard,
} from "lucide-react";
import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { Skeleton } from "#components/ui/skeleton";
import { useClientesShortList } from "../model/api/clientes-api";
import { useManagerDataClientes } from "../hooks/use-manager-data-clientes";

export default function ShowClientesLista() {
  const [query, setQuery] = useState("");
  const {
    data: clientesApi,
    isLoading,
    isError,
  } = useClientesShortList();
  const { ClientesList } = useManagerDataClientes(clientesApi);

  // Filtro optimizado con useMemo
  const filteredClientes = useMemo(() => {
    const normalizedTerm = query.toLowerCase().trim();
    if (!normalizedTerm) return ClientesList || [];

    return (ClientesList || []).filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(normalizedTerm),
      ),
    );
  }, [ClientesList, query]);

  if (isLoading) {
    return (
      <div className="px-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-muted-foreground/10">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !ClientesList) return <ErrorResultServer />;

  return (
    <div className="px-2 space-y-2">
      <div className="sticky top-0 px-4 z-10 bg-background/95 backdrop-blur-md pb-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lista de Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Registros de Clientes del sistema ({filteredClientes.length}).
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por RUC, Razón Social..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-muted/40 focus-visible:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Grid de Clientes */}
      {filteredClientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredClientes.map((chip, index) => (
            <Card
              key={chip.id || index}
              className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 border-muted-foreground/10"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                {/* Fila Superior: Razón Social e Índice */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-base tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {chip.razon_social}
                    </h3>
                  </div>
                  <span className="inline-flex items-center justify-center text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                    #{index + 1}
                  </span>
                </div>

                {/* Fila Inferior: Detalles del documento */}
                <div className="pt-2 border-t border-muted/60 flex items-center gap-2 text-xs text-muted-foreground">
                  <IdCard className="h-4 w-4 text-muted-foreground/70" />
                  <span className="font-mono tracking-wider bg-muted/50 px-2 py-1 rounded">
                    {chip.nro_documento}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl p-8 bg-muted/5">
          <div className="p-4 bg-muted/60 rounded-full mb-4 ring-8 ring-muted/20">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            No se encontraron resultados
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1.5">
            Intenta cambiar los términos de búsqueda o verifica los filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
}