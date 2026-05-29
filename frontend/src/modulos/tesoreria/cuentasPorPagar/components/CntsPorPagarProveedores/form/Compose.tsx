import { withForm } from "../../../../../../components/tanstackform/components/core/form";
import { FormRegistroPagoProveedores } from "./StructureFormData";


const LugarIngreso = [
  {label: "BCP Soles", value: "BCP Soles"},
  {label: "BCP Dólares", value: "BCP Dólares"},
  {label: "Caja Chica", value: "CAJA CHICA"},
]

const MedioPago = [
  {label: "Transferencia", value: "Transferencia"},
  {label: "Efectivo", value: "Efectivo"},
  
]

const StatusCobro = [
  {label: <div className="flex items-center gap-1"><span>Cancelado</span> <span className="text-red-500 text-[10px]">*(pagos totales)</span></div>, value: "CANCELADO"},
  {label: <div className="flex items-center gap-1"><span>Pendiente</span> <span className="text-red-500 text-[10px]">*(pagos parciales)</span></div>, value: "PENDIENTE"},
]

export const FromCntsPorPagarProveedoresUnico = withForm({
  ...FormRegistroPagoProveedores,

  render: ({ form }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shadow-olive-400 shadow-xs rounded-md p-2 text-[8px]">
        <form.AppField
          name="fecha_pago"
          children={(field) => (
            <field.DateField label="Fecha de Pago" placeholder="Seleccione"/>
          )}
        />
        <form.AppField
          name="lugar_salida"
          children={(field) => (
            <field.SelectFormFields
              label="Lugar de Ingreso"
              placeholder="Seleccione"
              options={LugarIngreso}
              maxLength={50}
            />
          )}
        />
        <form.AppField
          name="monto_pagado"
          children={(field) => (
            <field.NumberFloatField label="Monto Pagado" placeholder="Ingrese monto"/>
          )}
        />
        
        <form.AppField
          name="medio_pago"
          children={(field) => (
            <field.SelectFormFields
              label="Medio de Pago"
              placeholder="Seleccione"
              options={MedioPago}
            />
          )}
        />
        <form.AppField
          name="status_cobro"
          children={(field) => (
            <field.SelectFormFields
              label="Estado de Cobro"
              placeholder="Seleccione"
              options={StatusCobro}
            />
          )}
        />
        <form.AppField
          name="glosa_pago"
          children={(field) => (
            <field.TextAreaField
              label="Detalle"
              placeholder="Ingresar glosa del pago"
              maxLenght={600}
            />
          )}
        />
      </div>
    );
  },
});
