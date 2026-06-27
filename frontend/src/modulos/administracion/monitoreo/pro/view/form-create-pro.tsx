import { useMemo, useState } from "react";
import type {
  ClienteOutShortApiType,
  UbicacionOutApiType,
} from "../../../lista/clientes/model/api/clientes-schema-api";
import { useGetQueryData } from "../../../../../hooks/useGetQueryData";
import { CustomComboboxForm } from "#components/ui/input-search-new-custom-form";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "#components/ui/field";
import { Button } from "#components/ui/button";
import { Textarea } from "#components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#components/ui/popover";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "#components/ui/calendar";
import { Input } from "#components/ui/input";
import { toast } from "sonner";
import { ApiError } from "../../../../../api/normalizeError";
import { useCreatePro } from "../model/api/pro-api";
import type { ProCreateApiType } from "../model/api/pro-schema-api";

const ProCreateSchema = z.object({
  cliente_id: z.number().min(1, "Requerido"),
  ubicacion_id: z.number().min(1, "Requerido"),
  fecha_inicio: z.string().min(1, "Requerido"),
  fecha_fin: z.string().min(1, "Requerido"),
  estado: z.string().min(1, "Requerido"),
  fact_relacionada: z.string(),
  adicional: z.string(),
});

// 1. Tipos unificados y basados en tus APIs reales si es posible.
export type ComboboxOption = {
  value: string;
  label: string;
};

export function FormCreatePro() {
  const [fecha1, setFecha1] = useState(false);
  const [fecha2, setFecha2] = useState(false);
  const { mutateAsync } = useCreatePro();

  const clienteDataCache = useGetQueryData<ClienteOutShortApiType[]>([
    "clientes-lista-short",
  ]);
  const ubicacionDataCache = useGetQueryData<UbicacionOutApiType[]>([
    "ubicaciones-lista",
  ]);
  const clientesOptions = useMemo<ComboboxOption[]>(() => {
    if (!clienteDataCache) return [];
    return clienteDataCache.map((cl) => ({
      value: String(cl.id),
      label: cl.razon_social,
    }));
  }, [clienteDataCache]);

  const ubicacionesOptions = useMemo<ComboboxOption[]>(() => {
    if (!ubicacionDataCache) return [];
    return ubicacionDataCache.map((ub) => ({
      value: String(ub.id),
      label: ub.ubicacion,
    }));
  }, [ubicacionDataCache]);

  const form = useForm({
    defaultValues: {
      cliente_id: 0,
      ubicacion_id: 0,
      fecha_inicio: "",
      fecha_fin: "",
      estado: "PENDIENTE",
      fact_relacionada: "",
      adicional: "",
    },
    validators: {
      onSubmit: ProCreateSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ProCreateApiType = {
          cliente_id: value.cliente_id,
          ubicacion_id: value.ubicacion_id,
          fecha_inicio: value.fecha_inicio,
          fecha_fin: value.fecha_fin,
          estado: value.estado,
          fact_relacionada: value.fact_relacionada || "",
          adicional: value.adicional || "",
        };
        await mutateAsync(payload);
        toast.success("Registro realizado con éxito", {
          position: "top-center",
        });
        formApi.reset();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind !== "validation") {
            toast.error(err.message, {
              position: "top-center",
            });
          }
        } else {
          toast.error("Error inesperado. Intente de nuevo.", {
            position: "top-center",
          });
        }
      }
    },
  });

  return (
    <div className="flex flex-row flex-wrap gap-2 w-full max-w-md overflow-auto max-h-[calc(100vh-270px)]">
      <div className="p-6 w-full max-w-2xl mx-auto bg-background rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6">Registrar Servicio Pro</h2>

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
                  {!clienteDataCache ? (
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
                  {!ubicacionDataCache ? (
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
            name="adicional"
            children={(field) => (
              <Field>
                <FieldLabel>Información Adicional</FieldLabel>
                <FieldContent>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Observaciones o notas adicionales..."
                    className="min-h-25 resize-y"
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
                  "Registrar"
                )}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
