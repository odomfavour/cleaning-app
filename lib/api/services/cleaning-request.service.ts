import { apiClient } from "@/lib/api/client";
import type { CreateCleaningRequestInput } from "@/lib/validations/cleaning-request";
import type { AdminRequestDetail } from "@/lib/api/services/admin-cleaning-requests.service";

export type CleaningRequestResponse = {
  request: {
    id: string;
    reference: string;
    status: string;
    requestedServices: {
      serviceId: string;
      name: string;
    }[];
  };
};

export type CustomerRequestSummary = {
  id: string;
  reference: string;
  status:
    | "new"
    | "under_review"
    | "inspection_required"
    | "quote_sent"
    | "accepted"
    | "declined"
    | "rejected"
    | "completed"
    | "cancelled";
  services: string[];
  environment: string;
  submittedAt: string;
  quote: {
    id: string;
    totalKobo: number;
    status: string;
  } | null;
  bookingId?: string;
};

export type CustomerRequestDetail = {
  request: AdminRequestDetail["request"] & {
    services: string[];
    inspectionId?: string;
    quoteId?: string;
    bookingId?: string;
  };
  customer: AdminRequestDetail["customer"] | null;
  inspection: AdminRequestDetail["inspection"];
  quote: AdminRequestDetail["quote"];
  booking: AdminRequestDetail["booking"];
};

export async function getCustomerRequests(): Promise<CustomerRequestSummary[]> {
  const response = await apiClient.get<{ requests: CustomerRequestSummary[] }>(
    "/customer/requests",
  );

  return response.data.requests;
}

export async function getCustomerRequest(
  reference: string,
): Promise<CustomerRequestDetail> {
  const response = await apiClient.get<CustomerRequestDetail>(
    `/customer/requests/${encodeURIComponent(reference)}`,
  );
  return response.data;
}

export async function cancelCustomerRequest(reference: string): Promise<void> {
  await apiClient.patch(
    `/customer/requests/${encodeURIComponent(reference)}`,
    { action: "cancel" },
  );
}

export async function createCleaningRequest(
  input: CreateCleaningRequestInput,
): Promise<CleaningRequestResponse["request"]> {
  const response = await apiClient.post<CleaningRequestResponse>(
    "/cleaning-requests",
    input,
  );

  return response.data.request;
}
