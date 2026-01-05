import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../client";
import { createQuery } from "../../../../../query/createQuery";
import {
  WeatherCreateApiSchema,
  WeatherOutApiSchema,
  WeatherUpdateApiSchema,
  type WeatherCreateApiType,
  type WeatherOutApiType,
  type WeatherUpdateApiType,
} from "./weather.api.schema";
import { createMutation } from "../../../../../query/createMutation";
import type { ApiError } from "../../../../../normalizeError";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";

export function useWeatherList() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: createQuery({
      request: () => api.get("/weather"),
      schema: WeatherOutApiSchema.array(),
    }),
  });
}

export function useCreateWeather() {
  const qc = useQueryClient();

  return useMutation<WeatherOutApiType, ApiError, WeatherCreateApiType>({
    mutationFn: createMutation({
      request: (payload) => api.post("/weather", payload),
      inputSchema: WeatherCreateApiSchema,
      outputSchema: WeatherOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather"] });
    },
  });
}

export function useDeleteWeather() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/weather/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather"] });
    },
  });
}


export function useUpdateWeather(id: number) {
    const qc = useQueryClient();
    return useMutation<WeatherOutApiType, ApiError, WeatherUpdateApiType>({
        mutationFn: createMutation({
        request: (payload) => api.put(`/weather/${id}`, payload),
        inputSchema: WeatherUpdateApiSchema,
        outputSchema: WeatherOutApiSchema,
        }),
        onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["weather"] });
        },
    });

}