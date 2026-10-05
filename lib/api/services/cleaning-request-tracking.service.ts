import { apiClient } from "@/lib/api/client";

export type PublicRequestStatus = {
  reference: string;
  status: string;
  submittedAt: string;

  propertyType?: string;

  services: string[];

  inspection?: {
    status: "scheduled" | "completed" | "cancelled";
    scheduledAt: string;
    completedAt?: string;
  };

  hasQuote: boolean;

  quoteStatus?: "draft" | "sent" | "accepted" | "declined" | "expired";

  quoteSentAt?: string;
  quoteExpiresAt?: string;

  paymentStatus?: "initialized" | "success" | "failed" | "abandoned";

  paidAt?: string;

  hasBooking: boolean;

  bookingStatus?:
    | "confirmed"
    | "assigned"
    | "en_route"
    | "arrived"
    | "in_progress"
    | "completed"
    | "cancelled";

  bookingScheduledFor?: string;

  maskedEmail: string;
  maskedPhone: string;
};

export type VerifiedRequest = {
  id: string;
  reference: string;
  hasAccount: boolean;

  contact: {
    name: string;
    email: string;
    phone: string;
  };

  requestedServices: {
    serviceId: string;
    name: string;
  }[];

  propertyType?: string;

  address: {
    addressLine1: string;
    addressLine2?: string;
    area: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    landmark?: string;
    directions?: string;
  };

  propertyDetails: {
    environment?: string;
    livingRooms?: number;
    floors?: number;
    kitchens?: number;
    rooms?: number;
    size?: string;
    additional?: string;
  };

  bedrooms?: number;
  bathrooms?: number;

  preferredDate: string;
  preferredTimeSlot: string;

  schedule: {
    alternativeDate?: string;
    alternativeTimeSlot?: string;
    flexible: boolean;
  };

  notes?: string;

  photos: string[];

  status: string;
  submittedAt: string;

  quoteId?: string;
  bookingId?: string;
};

type PublicRequestStatusResponse = {
  status: PublicRequestStatus;
};

type VerifiedRequestResponse = {
  request: VerifiedRequest;
};

export async function getPublicRequestStatus(
  reference: string,
): Promise<PublicRequestStatus | null> {
  try {
    const response = await apiClient.get<PublicRequestStatusResponse>(
      `/cleaning-requests/${encodeURIComponent(reference)}/status`,
    );

    return response.data.status;
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response
        ? error.response.status
        : undefined;

    if (status === 404) return null;

    throw error;
  }
}

export async function getVerifiedRequest(
  reference: string,
): Promise<VerifiedRequest> {
  const response = await apiClient.get<VerifiedRequestResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}`,
  );

  return response.data.request;
}
