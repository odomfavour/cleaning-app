import {
  completeStaffInspection,
  getStaffInspection,
  getStaffInspections,
  saveStaffInspectionReport,
  startStaffInspection,
} from "@/lib/api/services/staff-inspections.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const staffInspectionKeys = {
  all: ["staff", "inspections"] as const,

  detail: (id: string) => [...staffInspectionKeys.all, "detail", id] as const,
};

export function useStaffInspections() {
  return useQuery({
    queryKey: staffInspectionKeys.all,
    queryFn: getStaffInspections,
  });
}

export function useStaffInspection(id: string) {
  return useQuery({
    queryKey: staffInspectionKeys.detail(id),
    queryFn: () => getStaffInspection(id),
    enabled: !!id,
  });
}

export function useStartStaffInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => startStaffInspection(id),

    onSuccess: (inspection) => {
      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.detail(inspection.id),
      });

      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.all,
      });
    },
  });
}

export function useCompleteStaffInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof completeStaffInspection>[1];
    }) => completeStaffInspection(id, input),

    onSuccess: (inspection) => {
      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.detail(inspection.id),
      });

      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.all,
      });
    },
  });
}

export function useSaveStaffInspectionReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof saveStaffInspectionReport>[1];
    }) => saveStaffInspectionReport(id, input),

    onSuccess: (inspection) => {
      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.detail(inspection.id),
      });

      queryClient.invalidateQueries({
        queryKey: staffInspectionKeys.all,
      });
    },
  });
}
