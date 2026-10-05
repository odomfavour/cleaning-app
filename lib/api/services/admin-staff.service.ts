// lib/api/admin-staff.ts

import { apiClient } from "@/lib/api/client";

export type AdminStaff = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "Cleaner" | "Team Lead" | "Inspector" | "Driver";
  availability: "available" | "on_job" | "off_duty";
  active: boolean;
  rating?: number;
  activeJobs: number;
  completedJobs: number;
};

type AdminStaffResponse = {
  staff: AdminStaff[];
};

export async function getAdminStaff(): Promise<AdminStaff[]> {
  const response = await apiClient.get<AdminStaffResponse>("/admin/staff");

  return response.data.staff;
}

export type CreateAdminStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminStaff["role"];
  availability: AdminStaff["availability"];
};

export async function createAdminStaff(
  input: CreateAdminStaffInput,
): Promise<AdminStaff> {
  const response = await apiClient.post<{ staff: AdminStaff }>(
    "/admin/staff",
    input,
  );

  return response.data.staff;
}

export type UpdateAdminStaffInput = Partial<
  Omit<CreateAdminStaffInput, "firstName" | "lastName">
> & {
  firstName?: string;
  lastName?: string;
  active?: boolean;
};

export async function updateAdminStaff(
  id: string,
  input: UpdateAdminStaffInput,
): Promise<AdminStaff> {
  const response = await apiClient.patch<{ staff: AdminStaff }>(
    `/admin/staff/${encodeURIComponent(id)}`,
    input,
  );

  return response.data.staff;
}
