import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { EfectivoSchemaOutApi, listasUnicasResponseSchema, SaldoEfectivoSchemaOutApi, type EfectivoSchemaCrearApiType, type EfectivoShemaUpdateApiType } from "./api.schema";


export function useCajaChicaLista(){
    return useQuery({
        queryKey: ["cajachica"],
        queryFn: createQuery({
            request: () => api.get("/cajachica"),
            schema: EfectivoSchemaOutApi.array(),
        }),
    })
};

export function useCajaChicaSaldoNeto(){
    return useQuery({
        queryKey: ["saldo_actual_cajachica"],
        queryFn: createQuery({
            request: () => api.get("/cajachica/saldos_independientes"),
            schema: SaldoEfectivoSchemaOutApi,
        }),
    })
};


export function useSyncCajaChica() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { created: EfectivoSchemaCrearApiType[], updates: EfectivoShemaUpdateApiType[] }) => {
            const { data } = await api.post("/cajachica", payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cajachica"] });
        },
    });
}


export function useDeleteCajaChica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Importante: Axios requiere pasar el body en la propiedad 'data' para el método DELETE
      const { data } = await api.delete("/cajachica/batch-delete", {
        data: { ids },
      });
      return data;
    },
    onSuccess: () => {
      // Refresca los datos del servidor para asegurar consistencia
      qc.invalidateQueries({ queryKey: ["cajachica"] });
    },
  });
}

export function useListasUnicasCajaChicaLista(){
    return useQuery({
        queryKey: ["listas_unicas_cajachica"],
        queryFn: createQuery({
            request: () => api.get("/cajachica/resumen_columnas"),
            schema: listasUnicasResponseSchema,
        }),
    })
};