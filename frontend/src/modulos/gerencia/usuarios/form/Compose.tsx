import { withForm } from "../../../../components/tanstackform/components/core/form";
import { FormUsuarioCreateUISchema } from "./StructureFormData";

const permisoOptions = [
  { value: "gerencia", label: <span className="text-gold-500">Gerencia</span>},
  { value: "administracion", label: <span className="text-blue-500">Administración</span>},
  { value: "contabilidad", label: <span className="text-green-500">Contabilidad</span>},
  { value: "tesoreria", label: <span className="text-cyan-500">Tesorería</span>},
  { value: "rrhh", label: <span className="text-purple-500">RRHH</span>},
  { value: "ventas", label: <span className="text-orange-500">Ventas</span>},
  { value: "almacen", label: <span className="text-lime-500">Almacén</span>},
  { value: "produccion", label: <span className="text-violet-500">Producción</span>},
];


const SelectEstado = [
  { value: "activo", label: <span className="text-green-500">Activo</span> },
  {
    value: "bloqueado",
    label: <span className="text-red-500">Bloqueado</span>,
  },

]

export const FromUsuarioCreate = withForm({
  ...FormUsuarioCreateUISchema,

  render: ({ form }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shadow-olive-400 shadow-xs rounded-md p-2 text-[8px]">
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField label="Nombre" placeholder="Seleccione"/>
          )}
        />
        <form.AppField
          name="last_name"
          children={(field) => (
            <field.TextField
              label="Apellidos"
              placeholder="Seleccione"
            />
          )}
        />
        <form.AppField
          name="email"
          children={(field) => (
            <field.TextField label="Email" placeholder="user@innovat.com"/>
          )}
        />
        
        <form.AppField
          name="cargo"
          children={(field) => (
            <field.TextField
              label="Cargo"
              placeholder="Técnico"
            />
          )}
        />
        <form.AppField
          name="estado"
          children={(field) => (
            <field.SelectFormFields
              label="Estado"
              placeholder="Seleccione"
              options={SelectEstado}
            />
          )}
        />
        
        <form.AppField
          name="password"
          children={(field) => (
            <field.TextField
              label="Contraseña"
              placeholder="********"
              maxLenght={15}
            />
          )}
        />
        <form.AppField
          name="permisos"
          children={(field) => (
            <field.SelectFormFields
              label="Permisos"
              placeholder="Seleccione"
              modeSelect="multiple"
              options={permisoOptions}
              
            />
          )}
        />
        <form.AppField
          name="image_byte"
          children={(field) => (
            <field.ImageField
              label="Imagen"
            />
          )}
        />
      </div>
    );
  },
});
