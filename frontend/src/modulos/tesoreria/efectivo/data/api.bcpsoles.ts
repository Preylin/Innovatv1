import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { EfectivoSchemaOutApi, type EfectivoSchemaCrearApiType, type EfectivoShemaUpdateApiType } from "./api.schema";


export function useBcpsolesLista(){
    return useQuery({
        queryKey: ["bcpsoles"],
        queryFn: createQuery({
            request: () => api.get("/bcpsoles"),
            schema: EfectivoSchemaOutApi.array(),
        }),
    })
};


export function useSyncbBcpsoles() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { created: EfectivoSchemaCrearApiType[], updates: EfectivoShemaUpdateApiType[] }) => {
            const { data } = await api.post("/bcpsoles", payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bcpsoles"] });
        },
    });
}


export function useDeletebBcpsoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Importante: Axios requiere pasar el body en la propiedad 'data' para el método DELETE
      const { data } = await api.delete("/bcpsoles/batch-delete", {
        data: { ids },
      });
      return data;
    },
    onSuccess: () => {
      // Refresca los datos del servidor para asegurar consistencia
      qc.invalidateQueries({ queryKey: ["bcpsoles"] });
    },
  });
}