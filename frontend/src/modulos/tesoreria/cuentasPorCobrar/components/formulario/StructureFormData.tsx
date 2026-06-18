import { formOptions } from '@tanstack/react-form'
import z from 'zod';
import { createFieldChecker } from '../../../../../helpers/isFieldMapErrorsInputsUI';


export const FormularioRegistroCobro = z.object({
  venta_id: z.number(),
  fecha_pago: z.string().min(1, "Requerido"),
  lugar_ingreso: z.string().min(1, "Requerido"),
  monto_pagado: z.number().min(0, "Requerido"),
  medio_pago: z.string().min(1, "Requerido"),
  status_cobro: z.string().min(1, "Requerido"),
  glosa_pago: z.string(),
});
export const isUsuarioFieldCntRegistroCobro = createFieldChecker(FormularioRegistroCobro);


export const FormRegistroCobro = formOptions({
  defaultValues: {
      venta_id: 0,
      fecha_pago: '',
      lugar_ingreso: '',
      monto_pagado: 0,
      medio_pago: '',
      status_cobro: '',
      glosa_pago: '',
    },
      validators: {
        onSubmit: FormularioRegistroCobro,
      },
})
