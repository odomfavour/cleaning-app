import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminCleaningRequestKeys } from "./use-admin-cleaning-requests";
import {
  completeAdminInspection,
  CompleteInspectionInput,
  getAdminInspection,
  getAdminInspections,
  scheduleAdminInspection,
  ScheduleInspectionInput,
  updateAdminInspectionStatus,
} from "@/lib/api/services/admin-inspections.service";

export const adminInspectionKeys = {
  all: ["admin", "inspections"] as const,

  detail: (id: string) => [...adminInspectionKeys.all, "detail", id] as const,
};

export function useAdminInspections() {
  return useQuery({
    queryKey: adminInspectionKeys.all,
    queryFn: getAdminInspections,
  });
}

export function useAdminInspection(id: string) {
  return useQuery({
    queryKey: adminInspectionKeys.detail(id),
    queryFn: () => getAdminInspection(id),
    enabled: Boolean(id),
  });
}

export function useScheduleAdminInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScheduleInspectionInput) =>
      scheduleAdminInspection(input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminInspectionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.detail(variables.requestId),
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.all,
      });
    },
  });
}

export function useUpdateAdminInspectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "cancelled" }) =>
      updateAdminInspectionStatus(id, status),

    onSuccess: (inspection) => {
      // The detail query returns:
      // { inspection, request }
      //
      // Do not replace that cache with the raw inspection.
      queryClient.invalidateQueries({
        queryKey: adminInspectionKeys.detail(inspection.id),
      });

      queryClient.invalidateQueries({
        queryKey: adminInspectionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.detail(inspection.requestId),
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.all,
      });
    },
  });
}

export function useCompleteAdminInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CompleteInspectionInput;
    }) => completeAdminInspection(id, input),

    onSuccess: (inspection) => {
      // The detail query returns:
      // { inspection, request }
      queryClient.invalidateQueries({
        queryKey: adminInspectionKeys.detail(inspection.id),
      });

      queryClient.invalidateQueries({
        queryKey: adminInspectionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.detail(inspection.requestId),
      });

      queryClient.invalidateQueries({
        queryKey: adminCleaningRequestKeys.all,
      });
    },
  });
}
