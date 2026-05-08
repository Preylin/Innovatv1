import { formOptions } from '@tanstack/react-form'
import { PersonalActivosCrearUI } from '../../api/personal/personal.schema'

export const FormOpts = formOptions({
  defaultValues: {
        dni: "",
        nombre: "",
        cargo: "",
        fecha_ingreso: "",
        rem_basico: 0,
        asig_familiar: 0,
        grati: 0,
        cts: 0,
        vacacion: 0,
      },
      validators: {
        onSubmit: PersonalActivosCrearUI,
      },
})