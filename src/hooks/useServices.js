import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "../api/services";

export function useServices(params = {}) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const response = await fetchServices(params);
      return response.data.data;
    },
  });
}