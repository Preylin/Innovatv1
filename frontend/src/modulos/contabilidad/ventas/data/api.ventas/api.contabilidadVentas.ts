import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../api/query/createQuery";
import api from "../../../../../api/client";
import { TablaVentasSchemaApiOut, type TablaVentasSchemaApiCreateType, type TablaVentasSchemaApiUpdateType } from "../api.schemasVentas/api.schemaVentas";




export function useContabilidadVentasLista(periodo: string){
    return useQuery({
        queryKey: ["contabilidad-ventas-lista", periodo],
        queryFn: createQuery({
            request: () => api.get("/contabilidad/ventas/lista", { params: { periodo } }),
            schema: TablaVentasSchemaApiOut.array(),
        }),
    })
};


export function useSyncbContabilidadVentas(periodo: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { created: TablaVentasSchemaApiCreateType[], updates: TablaVentasSchemaApiUpdateType[] }) => {
            const { data } = await api.post("/contabilidad/ventas/sync-ventas", payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["contabilidad-ventas-lista", periodo] });
        },
    });
}


export function useDeleteContabilidadVentas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { data } = await api.delete("/contabilidad/ventas/delete", {
        data: { ids },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contabilidad-ventas-lista"] });
    },
  });
}