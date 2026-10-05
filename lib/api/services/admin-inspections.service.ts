import { apiClient } from "@/lib/api/client";

export type InspectionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AdminInspection = {
  id: string;
  requestId: string;
  requestReference: string;

  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  inspector?: {
    id: string;
    name: string;
    role: "Cleaner" | "Team Lead" | "Inspector" | "Driver";
  };

  scheduledAt: string;
  status: InspectionStatus;

  report?: {
    condition?: string;
    size?: string;
    duration?: string;
    additionalServices?: string;
    specialRequirements?: string;
    notes?: string;
    photos: string[];
  };

  completedAt?: string;
};

export type AdminInspectionRequest = {
  id: string;
  reference: string;

  address: {
    addressLine1: string;
    addressLine2?: string;
    area?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    landmark?: string;
    directions?: string;
  };

  requestedServices: {
    serviceId: string;
    name: string;
  }[];

  notes?: string;
};

export type AdminInspectionDetail = {
  inspection: AdminInspection;
  request: AdminInspectionRequest;
};

type AdminInspectionsResponse = {
  inspections: AdminInspection[];
};

export async function getAdminInspections(): Promise<AdminInspection[]> {
  const response =
    await apiClient.get<AdminInspectionsResponse>("/admin/inspections");

  return response.data.inspections;
}

export async function getAdminInspection(
  id: string,
): Promise<AdminInspectionDetail> {
  const response = await apiClient.get<AdminInspectionDetail>(
    `/admin/inspections/${encodeURIComponent(id)}`,
  );

  return response.data;
}

export type ScheduleInspectionInput = {
  requestId: string;
  inspectorId: string;
  date: string;
  time: string;
};

export async function scheduleAdminInspection(
  input: ScheduleInspectionInput,
): Promise<AdminInspection> {
  const response = await apiClient.post<{
    inspection: AdminInspection;
  }>("/admin/inspections", input);

  return response.data.inspection;
}

export async function updateAdminInspectionStatus(
  id: string,
  status: "cancelled",
): Promise<AdminInspection> {
  const response = await apiClient.patch<{
    inspection: AdminInspection;
  }>(`/admin/inspections/${encodeURIComponent(id)}/status`, { status });

  return response.data.inspection;
}

export type CompleteInspectionInput = {
  condition: string;
  size: string;
  duration: string;
  additionalServices?: string;
  specialRequirements?: string;
  notes?: string;
  photos: string[];
};

export async function completeAdminInspection(
  id: string,
  input: CompleteInspectionInput,
): Promise<AdminInspection> {
  const response = await apiClient.post<{
    inspection: AdminInspection;
  }>(`/admin/inspections/${encodeURIComponent(id)}/complete`, input);

  return response.data.inspection;
}
