// src/lib/queries/Chips.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";
import {
  ChipCreateSchema,
  ChipOutSchema,
  ChipUpdateSchema,
  type ChipCreateType,
  type ChipOutType,
  type ChipUpdateType,
} from "./clientes.api.schemas";

export function useChipsList() {
  return useQuery({
    queryKey: ["chips"],
    queryFn: createQuery({
      request: () => api.get("/chips"),
      schema: ChipOutSchema.array(),
    }),
  });
}

export function useCreateChip() {
  const qc = useQueryClient();

  return useMutation<ChipOutType, ApiError, ChipCreateType>({
    mutationFn: createMutation({
      request: (payload) => api.post("/chips", payload),
      inputSchema: ChipCreateSchema,
      outputSchema: ChipOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chips"] });
    },
  });
}

export function useUpdateChip(id: number) {
  const qc = useQueryClient();

  return useMutation<ChipOutType, ApiError, ChipUpdateType>({
    mutationFn: createMutation({
      request: (payload) => api.put(`/chips/${id}`, payload),
      inputSchema: ChipUpdateSchema,
      outputSchema: ChipOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chips"] });
    },
  });
}

export function useDeleteChip() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/chips/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chips"] });
    },
  });
}
