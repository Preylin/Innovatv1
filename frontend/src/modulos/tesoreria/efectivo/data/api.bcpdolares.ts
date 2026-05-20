import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { EfectivoSchemaOutApi, listasUnicasResponseSchema, type EfectivoSchemaCrearApiType, type EfectivoShemaUpdateApiType } from "./api.schema";


export function useBcpdolaresLista(){
    return useQuery({
        queryKey: ["bcpdolares"],
        queryFn: createQuery({
            request: () => api.get("/bcpdolares"),
            schema: EfectivoSchemaOutApi.array(),
        }),
    })
};


export function useSyncbBcpdolares() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { created: EfectivoSchemaCrearApiType[], updates: EfectivoShemaUpdateApiType[] }) => {
            const { data } = await api.post("/bcpdolares", payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bcpdolares"] });
        },
    });
}


export function useDeletebBcpdolares() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Importante: Axios requiere pasar el body en la propiedad 'data' para el método DELETE
      const { data } = await api.delete("/bcpdolares/batch-delete", {
        data: { ids },
      });
      return data;
    },
    onSuccess: () => {
      // Refresca los datos del servidor para asegurar consistencia
      qc.invalidateQueries({ queryKey: ["bcpdolares"] });
    },
  });
}

export function useListasUnicasBcpdolaresLista(){
    return useQuery({
        queryKey: ["listas_unicas_bcpdolares"],
        queryFn: createQuery({
            request: () => api.get("/bcpdolares/resumen_columnas"),
            schema: listasUnicasResponseSchema,
        }),
    })
};