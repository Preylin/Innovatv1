import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "#components/ui/field";
import { Input } from "#components/ui/input";
import { Textarea } from "#components/ui/textarea";
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
import {  useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useUpdateChipInventario } from "../model/api/chips-inventario-api";
import type { ChipInventarioUpdateApiType } from "../model/api/chips-inventario-schema";

interface PropsComponent {
  chip_id: number;
  numero_chip: string;
  iccid?: string;
  operador?: string;
  plan?: string;
  fecha_activacion?: string;
  fecha_instalacion?: string;
  adicional?: string;
}

export type ComboboxOption = {
  value: string;
  label: string;
};
const ChipsInventarioUpdateSchema = z.object({
  numero_chip: z.string().min(1, "Requerido").max(12, "Máximo 12 caracteres"),
  iccid: z.string(),
  operador: z.string(),
  plan: z.string(),
  fecha_activacion: z.string(),
  fecha_instalacion: z.string(),
  adicional: z.string(),
});

export default function ActualizarRegistroChipsInventario({
  chip_id,
  numero_chip,
  iccid,
  operador,
  plan,
  fecha_activacion,
  fecha_instalacion,
  adicional,
}: PropsComponent) {
  const [fecha1, setFecha1] = useState(false);
  const [fecha2, setFecha2] = useState(false);
  const { mutateAsync } = useUpdateChipInventario(chip_id);

  const form = useForm({
    defaultValues: {
      numero_chip: numero_chip ?? "",
      iccid: iccid ?? "",
      operador: operador ?? "",
      plan: plan ?? "",
      fecha_activacion: fecha_activacion ?? "",
      fecha_instalacion: fecha_instalacion ?? "",
      adicional: adicional ?? "",
    },
    validators: {
      onSubmit: ChipsInventarioUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: ChipInventarioUpdateApiType = {
          numero_chip: value.numero_chip,
          iccid: value.iccid,
          operador: value.operador,
          plan: value.plan,
          fecha_activacion: value.fecha_activacion === "" ? null : value.fecha_activacion,
          fecha_instalacion: value.fecha_instalacion === "" ? null : value.fecha_instalacion,
          adicional: value.adicional,
        };
        console.log(payload);
        await mutateAsync(payload);
        toast.success("Registro actualizado con éxito", {
          position: "top-center",
        });
      } catch (e) {
        console.log(e);
      }
    },
  });

  return (
    <div className="p-6 w-full max-w-2xl mx-auto bg-background rounded-xl border shadow-sm overflow-auto">
      <h2 className="text-xl font-bold mb-6">Actualizar Registro Chips</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
         <form.Field
          name="numero_chip"
          defaultValue={numero_chip}
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
          name="iccid"
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
          name="operador"
          children={(field) => (
            <Field>
              <FieldLabel>Operador</FieldLabel>
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
          name="plan"
          children={(field) => (
            <Field>
              <FieldLabel>Plan de Datos</FieldLabel>
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


        {/* FECHAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="fecha_activacion"
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
            name="fecha_instalacion"
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
                "Actualizar Registro"
              )}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
