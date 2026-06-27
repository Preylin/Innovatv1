import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "#components/ui/field";
import { Input } from "#components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { Button } from "#components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#components/ui/popover";
import { Calendar } from "#components/ui/calendar";
import { useMemo, useState } from "react";
import {
  useClientesShortList,
  useUbicacionesList,
} from "../../../lista/clientes/model/api/clientes-api";
import { useForm } from "@tanstack/react-form";
import { CustomComboboxForm } from "../../../../../components/ui/input-search-new-custom-form";
import { toast } from "sonner";
import { useUpdateServiciosMC } from "../model/api/mc-api";
import type { McUpdateApiType } from "../model/api/mc-schema";


interface PropsComponent {
  id: number;
  cliente_id: number;
  ubicacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  fact_relacionada: string;
  estado: string;
  informe?: string;
  certificado?: string;
  encargado?: string;
  tecnico?: string;
  servicio?: string;
  incidencia?: string;
}

export type ComboboxOption = {
  value: string;
  label: string;
};
const MCUpdateSchema = z.object({
  cliente_id: z.number().min(1, "Requerido"),
  ubicacion_id: z.number().min(1, "Requerido"),
  fecha_inicio: z.string().min(1, "Requerido"),
  fecha_fin: z.string().min(1, "Requerido"),
  fact_relacionada: z.string(),
  informe: z.string(),
  certificado: z.string(),
  encargado: z.string(),
  tecnico: z.string(),
  servicio: z.string(),
  incidencia: z.string(),
  estado: z.string(),
});

export default function ActualizarRegistroMC({
  id,
  cliente_id,
  ubicacion_id,
  fecha_inicio,
  fecha_fin,
  fact_relacionada,
  estado,
  informe,
  certificado,
  encargado,
  tecnico,
  servicio,
  incidencia,
}: PropsComponent) {
  const [fecha1, setFecha1] = useState(false);
  const [fecha2, setFecha2] = useState(false);
  const { mutateAsync } = useUpdateServiciosMC(id);

  const { data: clientesApi, isLoading: isLoadingClientes } =
    useClientesShortList();
  const { data: ubicacionesApi, isLoading: isLoadingUbicaciones } =
    useUbicacionesList();

  const clientesOptions = useMemo<ComboboxOption[]>(() => {
    if (!clientesApi) return [];
    return clientesApi.map((cl) => ({
      value: String(cl.id),
      label: cl.razon_social,
    }));
  }, [clientesApi]);

  const ubicacionesOptions = useMemo<ComboboxOption[]>(() => {
    if (!ubicacionesApi) return [];
    return ubicacionesApi.map((ub) => ({
      value: String(ub.id),
      label: ub.ubicacion,
    }));
  }, [ubicacionesApi]);

  const form = useForm({
    defaultValues: {
      cliente_id: cliente_id,
      ubicacion_id: ubicacion_id ?? 0,
      fecha_inicio: fecha_inicio ?? "",
      fecha_fin: fecha_fin ?? "",
      fact_relacionada: fact_relacionada ?? "",
      estado: estado ?? "PENDIENTE",
      informe: informe ?? "",
      certificado: certificado ?? "",
      encargado: encargado ?? "",
      tecnico: tecnico ?? "",
      servicio: servicio ?? "",
      incidencia: incidencia ?? "",
    },
    validators: {
      onSubmit: MCUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: McUpdateApiType = {
          cliente_id: value.cliente_id,
          ubicacion_id: value.ubicacion_id,
          fecha_inicio: value.fecha_inicio,
          fecha_fin: value.fecha_fin,
          fact_relacionada: value.fact_relacionada || "",
          estado: value.estado,
          informe: value.informe.toUpperCase() || "",
          certificado: value.certificado.toUpperCase() || "",
          encargado: value.encargado.toUpperCase() || "",
          tecnico: value.tecnico.toUpperCase() || "",
          servicio: value.servicio.toUpperCase() || "",
          incidencia: value.incidencia.toUpperCase() || "",
        };
        await mutateAsync(payload);
        toast.success("Registro actualizado con éxito", {position: "top-center"});
      } catch (e) {
        console.log(e);
      }
    },
  });

  return (
    <div className="p-6 w-full max-w-2xl mx-auto bg-background rounded-xl border shadow-sm overflow-auto">
      <h2 className="text-xl font-bold mb-6">Actualizar Registro MC</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        {/* CLIENTE (Select) */}
        <form.Field
          name="cliente_id"
          children={(field) => (
            <Field>
              <FieldLabel>Cliente</FieldLabel>
              <FieldContent>
                {isLoadingClientes ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-start"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando clientes...
                  </Button>
                ) : (
                  <CustomComboboxForm
                    items={clientesOptions}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(val) => field.handleChange(Number(val))}
                    emptyText="No se encontraron clientes."
                  />
                )}
                {field.state.meta.isTouched &&
                  field.state.meta.errors?.length > 0 && (
                    <FieldError errors={field.state.meta.errors || []} />
                  )}
              </FieldContent>
            </Field>
          )}
        />

        {/* UBICACIÓN (Select) */}
        <form.Field
          name="ubicacion_id"
          children={(field) => (
            <Field>
              <FieldLabel>Ubicación</FieldLabel>
              <FieldContent>
                {isLoadingUbicaciones ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-start text-left font-normal"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando ubicaciones...
                  </Button>
                ) : (
                  <CustomComboboxForm
                    items={ubicacionesOptions}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(val) => field.handleChange(Number(val))}
                    emptyText="No se encontraron ubicaciones."
                  />
                )}
                {field.state.meta.isTouched &&
                  field.state.meta.errors?.length > 0 && (
                    <FieldError errors={field.state.meta.errors || []} />
                  )}
              </FieldContent>
            </Field>
          )}
        />

        {/* FECHAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="fecha_inicio"
            children={(field) => {
              // Al manejar un estado de apertura local por campo, aseguramos que se cierre al seleccionar
              const dateValue = field.state.value
                ? parseISO(field.state.value)
                : undefined;
              return (
                <Field>
                  <FieldLabel>Fecha Inicio</FieldLabel>
                  <FieldContent>
                    <Popover open={fecha1} onOpenChange={setFecha1}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!field.state.value && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {dateValue && isValid(dateValue) ? (
                            format(dateValue, "d/M/yyyy")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={dateValue}
                          defaultMonth={dateValue}
                          onSelect={(date) => {
                            field.handleChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            );
                            setFecha1(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors?.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                  </FieldContent>
                </Field>
              );
            }}
          />
          <form.Field
            name="fecha_fin"
            children={(field) => {
              const dateValue = field.state.value
                ? parseISO(field.state.value)
                : undefined;

              return (
                <Field>
                  <FieldLabel>Fecha Fin</FieldLabel>
                  <FieldContent>
                    <Popover open={fecha2} onOpenChange={setFecha2}>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!field.state.value && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {dateValue && isValid(dateValue) ? (
                            format(dateValue, "d/M/yyyy")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={dateValue}
                          defaultMonth={dateValue}
                          onSelect={(date) => {
                            field.handleChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            );
                            setFecha2(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors?.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                  </FieldContent>
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="fact_relacionada"
          children={(field) => (
            <Field>
              <FieldLabel>Factura Relacionada</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: 1234"
                />
              </FieldContent>
            </Field>
          )}
        />

        <form.Field
          name="estado"
          children={(field) => (
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                >
                  <SelectTrigger id={field.name} onBlur={field.handleBlur}>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="RENOVADO">Renovado</SelectItem>
                    <SelectItem value="NO RENOVADO">No renovado</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.isTouched &&
                  field.state.meta.errors?.length > 0 && (
                    <FieldError errors={field.state.meta.errors || []} />
                  )}
              </FieldContent>
            </Field>
          )}
        />
        {/* INFORME */}
         {/* INFORME */}
          <form.Field
            name="informe"
            children={(field) => (
              <Field>
                <FieldLabel>Informe</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: 1234"
                  />
                </FieldContent>
              </Field>
            )}
          />
          {/* CERTIFICADO */}
          <form.Field
            name="certificado"
            children={(field) => (
              <Field>
                <FieldLabel>Certificado</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: 1234"
                  />
                </FieldContent>
              </Field>
            )}
          />
          {/* ENCARGADO */}
          <form.Field
            name="encargado"
            children={(field) => (
              <Field>
                <FieldLabel>Encargado</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Juan Perez"
                  />
                </FieldContent>
              </Field>
            )}
          />
          {/* TECNICO */}
          <form.Field
            name="tecnico"
            children={(field) => (
              <Field>
                <FieldLabel>Tecnico</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Juan Perez"
                  />
                </FieldContent>
              </Field>
            )}
          />
          {/* SERVICIO */}
          <form.Field
            name="servicio"
            children={(field) => (
              <Field>
                <FieldLabel>Servicio</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Mantenimiento"
                  />
                </FieldContent>
              </Field>
            )}
          />
          {/* INCIDENTE */}
          <form.Field
            name="incidencia"
            children={(field) => (
              <Field>
                <FieldLabel>Incidencia</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Error en la instalación"
                  />
                </FieldContent>
              </Field>
            )}
          />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                "Actualizar Registro"
              )}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
