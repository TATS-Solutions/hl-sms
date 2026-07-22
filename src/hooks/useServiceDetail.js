import { useQuery } from "@tanstack/react-query";
import { fetchServiceBySlug } from "../api/services";

export function useServiceDetail(slug) {
  return useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const response = await fetchServiceBySlug(slug);
      return response.data.data;
    },
    enabled: !!slug,
  });
}