import { formOptions } from '@tanstack/react-form'
import z from 'zod';
import { createFieldChecker } from '../../../../../../helpers/isFieldMapErrorsInputsUI';


export const FormularioRegistroPagoProveedores = z.object({
  compra_id: z.number(),
  fecha_pago: z.string().min(1, "Requerido"),
  lugar_salida: z.string().min(1, "Requerido"),
  monto_pagado: z.number().min(0, "Requerido"),
  medio_pago: z.string().min(1, "Requerido"),
  status_cobro: z.string().min(1, "Requerido"),
  glosa_pago: z.string(),
});
export const isUsuarioFieldCntRegistroPagoProveedores = createFieldChecker(FormularioRegistroPagoProveedores);


export const FormRegistroPagoProveedores = formOptions({
  defaultValues: {
      compra_id: 0,
      fecha_pago: '',
      lugar_salida: '',
      monto_pagado: 0,
      medio_pago: '',
      status_cobro: '',
      glosa_pago: '',
    },
      validators: {
        onSubmit: FormularioRegistroPagoProveedores,
      },
})
