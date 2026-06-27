import { useState, useMemo } from "react";
import { Input } from "#components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";
import { Badge } from "#components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#components/ui/sheet";
import {
  Search,
  Cpu,
  Layers,
  Wifi,
  Inbox,
  Plus,
  CalendarDays,
  Wrench,
  FileText,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#components/ui/context-menu";
import { PencilIcon, TrashIcon } from "lucide-react";

import { useChipInventarioList, useDeleteChipInventarioSoft } from "../model/api/chips-inventario-api";
import { useManagerDataChipsInventario } from "../hooks/use-manager-data-chips-inventario";
import ErrorResultServer from "#components/pages/resultado/ErrorResultServer";
import { Skeleton } from "#components/ui/skeleton";
import { Button } from "#components/ui/button";
import ActualizarRegistroChipsInventario from "./actualizar-registro-inventario-chips";
import RegistroChipsInventario from "./crear-registro-inventario-chips";
import { toast } from "sonner";

type PanelMode = "create" | "update" | null;

interface ChipData {
  id: number;
  numero_chip: string;
  iccid?: string;
  operador?: string;
  plan?: string;
  fecha_instalacion?: string;
  fecha_activacion?: string;
  adicional?: string;
}

export function ShowChipsInventario() {
  const [query, setQuery] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>(null);

  const { mutateAsync: deleteChipSoft, isPending: isDeleting } = useDeleteChipInventarioSoft();
  
  const [selectedChip, setSelectedChip] = useState<ChipData | null>(null);

  const {
    data: chipsInventarioList,
    isLoading,
    isError,
  } = useChipInventarioList();
  const { ChipsInventarioList } = useManagerDataChipsInventario(chipsInventarioList);

  const filteredChipsInventario = useMemo(() => {
    const normalizedTerm = query.toLowerCase().trim();
    if (!normalizedTerm) return ChipsInventarioList || [];

    return (ChipsInventarioList || []).filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(normalizedTerm),
      ),
    );
  }, [ChipsInventarioList, query]);

  const handleOpenEdit = (chip: ChipData) => {
    setSelectedChip(chip);
    setPanelMode("update");
  };

  const handleClosePanel = (open: boolean) => {
    if (!open) {
      setPanelMode(null);
      setSelectedChip(null);
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este chip?")) return;
    
    try {
      await deleteChipSoft({ id, is_active: false }); 
      toast.success("Chip eliminado correctamente", {position: "top-center"});
    } catch (error) {
      toast.error("No se pudo eliminar el chip");
    }
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!chipsInventarioList || isError) return <ErrorResultServer />;

  return (
    <div className="space-y-4 pr-4">
      {/* HEADER DE LA VISTA */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inventario de Chips
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y visualiza las tarjetas SIM activas en el sistema.
          </p>
        </div>

        {/* BUSCADOR Y ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por número o ICCID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/50 focus-visible:bg-background"
            />
          </div>

          <Button
            onClick={() => setPanelMode("create")}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Nuevo chip
          </Button>
        </div>
      </div>

      {/* REJILLA DE TARJETAS CHIPS */}
      {filteredChipsInventario.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto max-h-[calc(100vh-320px)] p-1">
          {filteredChipsInventario.map((chip: ChipData) => (
            <ContextMenu key={chip.id}>
              <ContextMenuTrigger>
                <Card className="overflow-hidden transition-all hover:shadow-md border-muted-foreground/10">
                  <CardHeader className="bg-muted/40 pb-3 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold font-mono select-all">
                          {chip.numero_chip}
                        </CardTitle>
                        {chip.operador && (
                          <span className="text-xs text-muted-foreground block">
                            {chip.operador}
                          </span>
                        )}
                      </div>
                    </div>
                    {chip.plan && (
                      <Badge
                        variant="secondary"
                        className="font-medium text-xs"
                      >
                        <Wifi className="h-3 w-3 mr-1 inline-block" />
                        {chip.plan}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="pt-4 text-sm space-y-2.5">
                    {chip.iccid && (
                      <div className="flex items-center justify-between border-b border-muted/50 pb-1.5">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground/70" />
                          ICCID
                        </span>
                        <span className="font-mono text-xs font-medium">
                          {chip.iccid}
                        </span>
                      </div>
                    )}

                    {chip.fecha_activacion && (
                      <div className="flex items-center justify-between border-b border-muted/50 pb-1.5">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
                          Activación
                        </span>
                        <span className="text-foreground/90">
                          {chip.fecha_activacion}
                        </span>
                      </div>
                    )}

                    {chip.fecha_instalacion && (
                      <div className="flex items-center justify-between border-b border-muted/50 pb-1.5">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground/70" />
                          Instalación
                        </span>
                        <span className="text-foreground/90">
                          {chip.fecha_instalacion}
                        </span>
                      </div>
                    )}

                    {chip.adicional && (
                      <div className="pt-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                          <FileText className="h-3 w-3" /> Adicional
                        </span>
                        <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md italic">
                          {chip.adicional}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem onClick={() => handleOpenEdit(chip)}>
                    <PencilIcon />
                    Editar
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => handleDelete(chip.id)}
                  >
                    <TrashIcon />
                    Delete
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl p-8 bg-muted/10">
          <Inbox className="h-6 w-6 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">
            No se encontraron resultados
          </h3>
        </div>
      )}

      <Sheet
        open={panelMode !== null}
        onOpenChange={handleClosePanel}
      >
        <SheetContent
          side="right"
          className="w-100 sm:max-w-112.5 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {panelMode === "create"}
            </SheetTitle>
            <SheetDescription>
              {panelMode === "create"
                ? "Introduce los datos de la nueva SIM para ingresarla al sistema."
                : "Modifica la información asignada a esta tarjeta de inventario."}
            </SheetDescription>
          </SheetHeader>

          <div className="py-2">
            {panelMode === "create" && <RegistroChipsInventario />}
            
            {panelMode === "update" && selectedChip && (
              <ActualizarRegistroChipsInventario
                chip_id={selectedChip.id}
                numero_chip={selectedChip.numero_chip}
                iccid={selectedChip.iccid}
                operador={selectedChip.operador}
                plan={selectedChip.plan}
                fecha_activacion={selectedChip.fecha_instalacion}
                fecha_instalacion={selectedChip.fecha_activacion}
                adicional={selectedChip.adicional}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
