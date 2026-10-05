import { apiClient } from "@/lib/api/client";

export type AdminBooking = {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
  title: string;
  scheduledFor: string | null;
  requestedDate: string | null;
  requestedTime: string | null;
  staff: { id: string; name: string }[];
  status:
    | "confirmed"
    | "assigned"
    | "en_route"
    | "arrived"
    | "in_progress"
    | "completed"
    | "cancelled";
  amountKobo: number;
  createdAt: string;
};

export type AdminBookingDetails = {
  booking: {
    id: string;
    bookingNumber: string;
    status: AdminBooking["status"];
    amountKobo: number;
    paymentReference: string;
    scheduledFor: string | null;
    confirmedAt: string;
    assignedStaffIds: string[];
  };
  request: {
    id: string;
    reference: string;
    services: string[];
    location: string;
    preferredDate: string | null;
    preferredTime: string | null;
    instructions: string;
  } | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  payment: {
    reference: string;
    status: string;
    paidAt: string | null;
  } | null;
  staff: {
    id: string;
    name: string;
    role: string;
    phone: string;
    availability: "available" | "on_job" | "off_duty";
  }[];
};

export type AdminBookingUpdate = {
  staffIds?: string[];
  status?: AdminBooking["status"];
};

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const response = await apiClient.get<{ bookings: AdminBooking[] }>(
    "/admin/bookings",
  );

  return response.data.bookings;
}

export async function getAdminBooking(
  id: string,
): Promise<AdminBookingDetails> {
  const response = await apiClient.get<{ booking: AdminBookingDetails }>(
    `/admin/bookings/${encodeURIComponent(id)}`,
  );

  return response.data.booking;
}

export async function updateAdminBooking(
  id: string,
  update: AdminBookingUpdate,
): Promise<AdminBookingDetails> {
  const response = await apiClient.patch<{ booking: AdminBookingDetails }>(
    `/admin/bookings/${encodeURIComponent(id)}`,
    update,
  );

  return response.data.booking;
}
