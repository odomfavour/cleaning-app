import { apiClient } from "@/lib/api/client";
import type { CreateCleaningRequestInput } from "@/lib/validations/cleaning-request";

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

export async function getCustomerRequests(): Promise<CustomerRequestSummary[]> {
  const response = await apiClient.get<{ requests: CustomerRequestSummary[] }>(
    "/customer/requests",
  );

  return response.data.requests;
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
