import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../client";
import { createQuery } from "../../../../../query/createQuery";
import { createMutation } from "../../../../../query/createMutation";
import type { ApiError } from "../../../../../normalizeError";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";
import { ProCreateApiSchema, ProOutApiSchema, ProUpdateApiSchema, type ProCreateApiType, type ProOutApiType, type ProUpdateApiType } from "./pro.api.schema";


export function useProList(){
    return useQuery({
        queryKey: ["pro"],
        queryFn: createQuery({
            request: () => api.get("/pro"),
            schema: ProOutApiSchema.array(),
        }),
    })
}

export function useCreatePro(){
    const qc = useQueryClient();
    return useMutation<ProOutApiType, ApiError, ProCreateApiType>({
        mutationFn: createMutation({
            request: (payload) => api.post("/pro", payload),
            inputSchema: ProCreateApiSchema,
            outputSchema: ProOutApiSchema,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pro"] });
        },
    });
}

export function useDeletePro(){
    const qc = useQueryClient();
    return useMutation<void, ApiError, number>({
        mutationFn: (id: number) =>
            createDeleteMutation({
                request: () =>
                    api.delete(`/pro/${id}`),
            })(),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ["pro"] });
            },
    });
}

export function useUpdatePro( id: number){
    const qc = useQueryClient();
    return useMutation<ProOutApiType, ApiError, ProUpdateApiType>({
        mutationFn: createMutation({
            request: (payload) => api.put(`/pro/${id}`, payload),
            inputSchema: ProUpdateApiSchema,
            outputSchema: ProOutApiSchema,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pro"] });
        },
    })

}
