import { apiClient } from "@/lib/api/client";

export type AdminCleaningRequest = {
  id: string;
  reference: string;
  customerId: string;

  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  services: string[];

  environment?: string;
  propertyType?: string;

  submittedAt: string;
  status:
    | "submitted"
    | "reviewing"
    | "inspection_required"
    | "inspection_scheduled"
    | "quoted"
    | "accepted"
    | "declined"
    | "converted"
    | "cancelled";
};

type AdminCleaningRequestsResponse = {
  requests: AdminCleaningRequest[];
};

export async function getAdminCleaningRequests(): Promise<
  AdminCleaningRequest[]
> {
  const response = await apiClient.get<AdminCleaningRequestsResponse>(
    "/admin/cleaning-requests",
  );

  return response.data.requests;
}

export type AdminRequestDetail = {
  request: {
    id: string;
    reference: string;
    customerId: string;
    status:
      | "submitted"
      | "reviewing"
      | "inspection_required"
      | "inspection_scheduled"
      | "quoted"
      | "accepted"
      | "declined"
      | "converted"
      | "cancelled";

    requestedServices: {
      serviceId: string;
      name: string;
    }[];

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

    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;

    propertyDetails: {
      environment?: string;
      livingRooms?: number;
      floors?: number;
      kitchens?: number;
      rooms?: number;
      size?: string;
      additional?: string;
    };

    preferredDate?: string;
    preferredTimeSlot?: string;

    schedule: {
      alternativeDate?: string;
      alternativeTimeSlot?: string;
      flexible: boolean;
    };

    notes?: string;
    photos: string[];

    createdAt: string;
    updatedAt: string;
  };

  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    hasAccount: boolean;
  };

  inspection: {
    id: string;
    scheduledAt: string;
    status: "scheduled" | "completed" | "cancelled";
    notes?: string;
    findings?: string;
    completedAt?: string;
  } | null;

  quote: {
    id: string;
    quoteNumber: string;
    status: "draft" | "sent" | "accepted" | "declined" | "expired";
    totalKobo: number;
    sentAt?: string;
    expiresAt?: string;
    acceptedAt?: string;
    declinedAt?: string;
  } | null;

  booking: {
    id: string;
    bookingNumber: string;
    status:
      | "confirmed"
      | "assigned"
      | "en_route"
      | "arrived"
      | "in_progress"
      | "completed"
      | "cancelled";
    scheduledFor?: string;
  } | null;
};

type AdminRequestDetailResponse = {
  data: AdminRequestDetail;
};

export async function getAdminCleaningRequest(
  id: string,
): Promise<AdminRequestDetail> {
  const response = await apiClient.get<AdminRequestDetailResponse>(
    `/admin/cleaning-requests/${encodeURIComponent(id)}`,
  );

  return response.data.data;
}

export async function updateAdminCleaningRequestStatus(
  id: string,
  status: "reviewing" | "declined" | "cancelled",
  note?: string,
): Promise<AdminRequestDetail["request"]> {
  const response = await apiClient.patch<{
    request: AdminRequestDetail["request"];
  }>(`/admin/cleaning-requests/${encodeURIComponent(id)}/status`, {
    status,
    note,
  });

  return response.data.request;
}
