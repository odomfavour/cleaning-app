import { apiClient } from "@/lib/api/client";

export type StaffInspectionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type StaffInspection = {
  id: string;
  requestId: string;
  requestReference: string;

  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };

  scheduledAt: string;
  status: StaffInspectionStatus;

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

export type StaffInspectionDetail = StaffInspection & {
  requestedServices: {
    serviceId: string;
    name: string;
  }[];

  requestNotes?: string;
};

export type CompleteStaffInspectionInput = {
  condition: string;
  size: string;
  duration: string;
  additionalServices?: string;
  specialRequirements?: string;
  notes?: string;
  photos: string[];
};

export async function getStaffInspections(): Promise<StaffInspection[]> {
  const response = await apiClient.get<{
    inspections: StaffInspection[];
  }>("/staff/inspections");

  return response.data.inspections;
}

export async function getStaffInspection(
  id: string,
): Promise<StaffInspectionDetail> {
  const response = await apiClient.get<{
    inspection: StaffInspectionDetail;
  }>(`/staff/inspections/${encodeURIComponent(id)}`);

  return response.data.inspection;
}

export async function startStaffInspection(
  id: string,
): Promise<StaffInspection> {
  const response = await apiClient.patch<{
    inspection: StaffInspection;
  }>(`/staff/inspections/${encodeURIComponent(id)}/status`, {
    status: "in_progress",
  });

  return response.data.inspection;
}

export async function completeStaffInspection(
  id: string,
  input: CompleteStaffInspectionInput,
): Promise<StaffInspection> {
  const response = await apiClient.post<{
    inspection: StaffInspection;
  }>(`/staff/inspections/${encodeURIComponent(id)}/complete`, input);

  return response.data.inspection;
}

export type SaveStaffInspectionReportInput = {
  condition: string;
  size: string;
  duration: string;
  additionalServices?: string;
  specialRequirements?: string;
  notes?: string;
  photos: string[];
};

export async function saveStaffInspectionReport(
  id: string,
  input: SaveStaffInspectionReportInput,
): Promise<StaffInspection> {
  const response = await apiClient.patch<{ inspection: StaffInspection }>(
    `/staff/inspections/${encodeURIComponent(id)}/report`,
    input,
  );

  return response.data.inspection;
}
