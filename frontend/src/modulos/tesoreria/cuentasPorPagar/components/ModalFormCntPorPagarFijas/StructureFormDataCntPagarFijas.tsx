import { formOptions } from '@tanstack/react-form'
import z from 'zod';
import { createFieldChecker } from '../../../../../helpers/isFieldMapErrorsInputsUI';


export const CuentasPorPagarCreateUISchema = z.object({
  empresa: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  detalle: z.string().min(3, "Mínimo 3 caracteres").max(600, "Máximo 600 caracteres"),
  monto_esperado: z.number().min(0, "Debe ser mayor a 0"),
  moneda: z.string().min(3, "Requerido"),
  dia_pago: z.number().min(1, "Debe ser mayor a 0").max(30, "Debe ser menor o igual a 30"),
  categoria: z.string().min(3, "Requerido mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
});
export const isUsuarioFieldCuentasPorPagarFijas = createFieldChecker(CuentasPorPagarCreateUISchema);


export const FormOptsCntsPorPagarFijas = formOptions({
  defaultValues: {
      empresa: "",
      detalle: "",
      monto_esperado: 0,
      moneda: "",
      dia_pago: 1,
      categoria: "",
    },
      validators: {
        onSubmit: CuentasPorPagarCreateUISchema,
      },
})
