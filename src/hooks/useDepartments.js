import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "../api/services";

export function useDepartments(options = {}) {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fetchDepartments();
      return response.data.data;
    },
    ...options,
  });
}
