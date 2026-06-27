import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../../api/client";
import { createQuery } from "../../../../../../api/query/createQuery";
import {
  ActualizarEstadoSchema,
  ChipsMasivaApiSchema,
  MCMasivaApiSchema,
  ProMasivaApiSchema,
  WeatherCreateApiSchema,
  WeatherMasivaApiSchema,
  WeatherOutApiSchema,
  WeatherUpdateApiSchema,
  type ActualizarEstadoSchemaType,
  type WeatherCreateApiType,
  type WeatherUpdateApiType,
} from "./weather-schema-api";
import { createMutation } from "../../../../../../api/query/createMutation";
import type { ApiError } from "../../../../../../api/normalizeError";
import { createDeleteMutation } from "../../../../../../api/query/createDeleteMutation";

export function useWeatherList() {
  return useQuery({
    queryKey: ["weather-lista"],
    queryFn: createQuery({
      request: () => api.get("/servicio-weather/mostrar"),
      schema: WeatherOutApiSchema.array(),
    }),
  });
}

// exportacion masiva

export function useExportWeatherMasiva(
  cliente_id: number,
  ubicacion_id: number,
) {
  return useQuery({
    //  Se agregan las dependencias a la llave del caché
    queryKey: ["weather-masiva", cliente_id, ubicacion_id],
    queryFn: createQuery({
      request: () =>
        api.post(
          `/servicio-weather/importar-weather-masiva/${cliente_id}/${ubicacion_id}`,
        ),
      schema: WeatherMasivaApiSchema.array(),
    }),
    enabled: cliente_id > -1 && ubicacion_id > -1,
  });
}

export function useExportProMasiva(cliente_id: number, ubicacion_id: number) {
  return useQuery({
    //  Se agregan las dependencias a la llave del caché
    queryKey: ["pro-masiva", cliente_id, ubicacion_id],
    queryFn: createQuery({
      request: () =>
        api.post(
          `/servicio-weather/importar-pro-masiva/${cliente_id}/${ubicacion_id}`,
        ),
      schema: ProMasivaApiSchema.array(),
    }),
    enabled: cliente_id > -1 && ubicacion_id > -1,
  });
}

export function useExportMCMasiva(cliente_id: number, ubicacion_id: number) {
  return useQuery({
    //  Se agregan las dependencias a la llave del caché
    queryKey: ["mc-masiva", cliente_id, ubicacion_id],
    queryFn: createQuery({
      request: () =>
        api.post(
          `/servicio-weather/importar-mc-masiva/${cliente_id}/${ubicacion_id}`,
        ),
      schema: MCMasivaApiSchema.array(),
    }),
    enabled: cliente_id > -1 && ubicacion_id > -1,
  });
}

export function useExportChipsMasiva(cliente_id: number, ubicacion_id: number) {
  return useQuery({
    //  Se agregan las dependencias a la llave del caché
    queryKey: ["chips-masiva", cliente_id, ubicacion_id],
    queryFn: createQuery({
      request: () =>
        api.post(
          `/servicio-weather/importar-chips-masiva/${cliente_id}/${ubicacion_id}`,
        ),
      schema: ChipsMasivaApiSchema.array(),
    }),
    enabled: cliente_id > -1 && ubicacion_id > -1,
  });
}

export function useUpdateWeather(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, WeatherUpdateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/servicio-weather/actualizar/${id}`, payload),
      inputSchema: WeatherUpdateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather-lista"] });
    },
  });
}

//actualizar estado
export function useUpdateWeatherEstado(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ActualizarEstadoSchemaType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.patch(`/servicio-weather/actualizar-weather-estado/${id}`, payload),
      inputSchema: ActualizarEstadoSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather-lista"] });
    },
  });
}

export function useCreateWeather() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, WeatherCreateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/servicio-weather/registrar-servicio-weather", payload),
      inputSchema: WeatherCreateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather-lista"] });
    },
  });
}

export function useDeleteWeather() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/servicio-weather/eliminar-servicio-weather/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weather-lista"] });
    },
  });
}
