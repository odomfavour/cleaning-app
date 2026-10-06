import { apiClient } from "@/lib/api/client";

export type CustomerBooking = {
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
  amountKobo: number;
  paymentReference: string;
  date: string | null;
  time: string | null;
  location: string;
  title: string;
  instructions: string;
  requestReference: string;
  team: {
    id: string;
    name: string;
    role: string;
    phone: string;
  }[];
  payment: {
    reference: string;
    status: string;
    paidAt: string | null;
  } | null;
  review: {
    rating: number;
    comment: string;
    photos: string[];
  } | null;
};

export async function submitCustomerBookingReview(
  bookingId: string,
  input: { rating: number; comment: string; photos: string[] },
): Promise<void> {
  await apiClient.post(
    `/customer/bookings/${encodeURIComponent(bookingId)}/review`,
    input,
  );
}

export async function getCustomerBookings(): Promise<CustomerBooking[]> {
  const response = await apiClient.get<{ bookings: CustomerBooking[] }>(
    "/customer/bookings",
  );
  return response.data.bookings;
}

export async function getCustomerBooking(id: string): Promise<CustomerBooking> {
  const response = await apiClient.get<{ booking: CustomerBooking }>(
    `/customer/bookings/${encodeURIComponent(id)}`,
  );
  return response.data.booking;
}
