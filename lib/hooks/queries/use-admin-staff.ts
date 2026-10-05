// lib/hooks/queries/use-admin-staff.ts

import {
  createAdminStaff,
  CreateAdminStaffInput,
  getAdminStaff,
  updateAdminStaff,
  UpdateAdminStaffInput,
} from "@/lib/api/services/admin-staff.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const adminStaffKeys = {
  all: ["admin", "staff"] as const,
};

export function useAdminStaff() {
  return useQuery({
    queryKey: adminStaffKeys.all,
    queryFn: getAdminStaff,
  });
}

export function useCreateAdminStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdminStaffInput) => createAdminStaff(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminStaffKeys.all,
      });
    },
  });
}

export function useUpdateAdminStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminStaffInput }) =>
      updateAdminStaff(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminStaffKeys.all,
      });
    },
  });
}
