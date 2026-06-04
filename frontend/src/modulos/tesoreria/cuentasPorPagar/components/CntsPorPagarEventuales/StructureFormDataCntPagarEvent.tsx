import { formOptions } from '@tanstack/react-form'
import z from 'zod';
import { createFieldChecker } from '../../../../../helpers/isFieldMapErrorsInputsUI';


export const CuentasPorPagarEventualCreateUISchema = z.object({
  fecha_emision: z.string().min(1, "Requerido"),
  fecha_vencimiento: z.string().min(1, "Requerido"),
  empresa: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  detalle: z.string().min(3, "Mínimo 3 caracteres").max(600, "Máximo 600 caracteres"),
  monto_esperado: z.number().min(1, "Debe ser mayor a 0"),
  moneda: z.string().min(3, "Requerido"),
});
export const isUsuarioFieldCuentasPorPagarEventual = createFieldChecker(CuentasPorPagarEventualCreateUISchema);


export const FormOptsCntsPorPagarEventual = formOptions({
  defaultValues: {
      fecha_emision: "",
      fecha_vencimiento: "",
      empresa: "",
      detalle: "",
      monto_esperado: 0,
      moneda: "",
    },
      validators: {
        onSubmit: CuentasPorPagarEventualCreateUISchema,
      },
})


export const FormularioRegistroPagoEventuales = z.object({
  obligacion_id: z.number(),
  fecha_operacion: z.string().min(1, "Requerido"),
  lugar_salida: z.string(),
  monto_pagado: z.number().min(1, "Requerido"),
  medio_pago: z.string().min(1, "Requerido"),
  status_cobro: z.string().min(1, "Requerido"),
  glosa_pago: z.string(),
});
export const isUsuarioFieldCntRegistroPagoEventuales = createFieldChecker(FormularioRegistroPagoEventuales);


export const FormRegistroPagoEventuales = formOptions({
  defaultValues: {
      obligacion_id: 0,
      fecha_operacion: '',
      lugar_salida: '',
      monto_pagado: 0,
      medio_pago: '',
      status_cobro: '',
      glosa_pago: '',
    },
      validators: {
        onSubmit: FormularioRegistroPagoEventuales,
      },
})
