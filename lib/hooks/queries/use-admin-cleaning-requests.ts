import {
  getAdminCleaningRequest,
  getAdminCleaningRequests,
  updateAdminCleaningRequestStatus,
} from "@/lib/api/services/admin-cleaning-requests.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const adminCleaningRequestKeys = {
  all: ["admin", "cleaning-requests"] as const,

  detail: (id: string) =>
    [...adminCleaningRequestKeys.all, "detail", id] as const,
};

export function useAdminCleaningRequests() {
  return useQuery({
    queryKey: adminCleaningRequestKeys.all,
    queryFn: getAdminCleaningRequests,
  });
}

export function useAdminCleaningRequest(id: string) {
  return useQuery({
    queryKey: adminCleaningRequestKeys.detail(id),
    queryFn: () => getAdminCleaningRequest(id),
    enabled: !!id,
  });
}

export function useUpdateAdminCleaningRequestStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status,
      note,
    }: {
      status: "reviewing" | "declined" | "cancelled";
      note?: string;
    }) => updateAdminCleaningRequestStatus(id, status, note),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.all,
      });
    },
  });
}
