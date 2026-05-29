import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TablaComprasSchemaApiOut, type TablaComprasSchemaApiCreateType, type TablaComprasSchemaApiUpdateType } from "./api.schemaCompras";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";




export function useContabilidadComprasLista(periodo: string){
    return useQuery({
        queryKey: ["contabilidad-compras-lista", periodo],
        queryFn: createQuery({
            request: () => api.get("/contabilidad/compras/lista", { params: { periodo } }),
            schema: TablaComprasSchemaApiOut.array(),
        }),
    })
};


export function useSyncbContabilidadCompras(periodo: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { created: TablaComprasSchemaApiCreateType[], updates: TablaComprasSchemaApiUpdateType[] }) => {
            const { data } = await api.post("/contabilidad/compras/sync-compras", payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["contabilidad-compras-lista", periodo] });
        },
    });
}


export function useDeleteContabilidadCompras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { data } = await api.delete("/contabilidad/compras/delete", {
        data: { ids },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contabilidad-compras-lista"] });
    },
  });
}