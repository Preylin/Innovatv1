import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export function useGetQueryData<TData = unknown>(
  queryKey: QueryKey,
): TData | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<TData>(queryKey);
}
