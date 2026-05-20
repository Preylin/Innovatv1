import { withForm } from "../formulario/components/core/form";
import { FormOptsCntsPorPagarFijas } from "./StructureFormDataCntPagarFijas";

const OptionSelect = [
  { label: "Soles (PEN)", value: "PEN" },
  { label: "Dólares (USD)", value: "USD" },
];

const OptionSelect2 = [
  { label: "Servicios Intenet", value: "servicios internet" },
  { label: "Servicios Básicos", value: "servicios básicos" },
  { label: "Planilla", value: "planilla" },
  { label: "Otros", value: "otros" },
];

export const FromCntsPorPabarFijas = withForm({
  ...FormOptsCntsPorPagarFijas,
  render: ({ form }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shadow-olive-400 shadow-xs rounded-md p-4">
        <form.AppField
          name="empresa"
          children={(field) => (
            <field.TextField label="Empresa / Proveedor" maxLenght={100} />
          )}
        />
        <form.AppField
          name="monto_esperado"
          children={(field) => <field.NumberField label="Monto Mensual" />}
        />
        <form.AppField
          name="dia_pago"
          children={(field) => (
            <field.NumberField label="Día de Vencimiento" maxLength={30} />
          )}
        />
        <form.AppField
          name="categoria"
          children={(field) => (
            <field.SelectFormWithInputFields
              label="Categoría"
              placeholder="Seleccionar Categoría"
              options={OptionSelect2}
              maxLength={50}
            />
          )}
        />
        <form.AppField
          name="moneda"
          children={(field) => (
            <field.SelectFormFields
              label="Moneda"
              placeholder="Seleccionar Moneda"
              options={OptionSelect}
            />
          )}
        />
        <form.AppField
          name="detalle"
          children={(field) => (
            <field.TextAreaField
              label="Detalle"
              placeholder="Ingresar detalle de la obligación..."
              maxLenght={600}
            />
          )}
        />
      </div>
    );
  },
});
