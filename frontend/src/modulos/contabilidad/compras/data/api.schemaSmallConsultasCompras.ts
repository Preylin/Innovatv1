import z from "zod";


export const GetYearsShemaApi = z.array(
  z.string()
);
export type GetYearsShemaApiType = z.infer<typeof GetYearsShemaApi>;