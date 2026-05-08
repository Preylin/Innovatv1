import { withForm } from "../UI/inputs/form/form";
import { FormOpts } from "./structureCrearPersonal";

export const FormPersonalFields = withForm({
  ...FormOpts,
  render: ({ form }) => {
    return (
      <div className="flex flex-col gap-2 dark:text-black">
        <div className="p-2 flex flex-col bg-mist-200 rounded-md shadow-md shadow-mist-300/50">
          <form.AppField
            name="dni"
            children={(field) => <field.TextField label="DNI" maxLenght={10} />}
          />
          <form.AppField
            name="nombre"
            children={(field) => (
              <field.TextField label="NOMBRES Y APELLIDOS" />
            )}
          />
          <form.AppField
            name="cargo"
            children={(field) => <field.TextField label="CARGO" />}
          />
        </div>
        <div className="p-2 flex flex-col bg-mist-200 rounded-md shadow-md shadow-mist-300/50">
          <form.AppField
            name="fecha_ingreso"
            children={(field) => <field.DateField label="FECHA DE INGRESO" />}
          />
          <form.AppField
            name="rem_basico"
            children={(field) => (
              <field.NumberField label="REMUNERACIÓN BÁSICA" />
            )}
          />
          <form.AppField
            name="asig_familiar"
            children={(field) => (
              <field.NumberField label="ASIGNACIÓN FAMILIAR" />
            )}
          />
        </div>
        <div className="p-2 flex flex-col bg-mist-200 rounded-md shadow-md shadow-mist-300/50">
          <form.AppField
            name="grati"
            children={(field) => <field.NumberField label="GRATIFICACIÓN" />}
          />
          <form.AppField
            name="cts"
            children={(field) => <field.NumberField label="CTS" />}
          />
          <form.AppField
            name="vacacion"
            children={(field) => <field.NumberField label="VACACIONES" />}
          />
        </div>
      </div>
    );
  },
});
