import z from "zod";


export const GetYearsShemaApi = z.array(
  z.string()
    .length(4, "El año debe tener exactamente 4 dígitos")
    .regex(/^\d{4}$/, "El año debe contener solo números")
);
export type GetYearsShemaApiType = z.infer<typeof GetYearsShemaApi>;