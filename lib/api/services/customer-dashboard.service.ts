import { apiClient } from "@/lib/api/client";

export type CustomerDashboardData = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
  };
  requests: {
    id: string;
    reference: string;
    status: string;
    services: string[];
    submittedAt: string;
    quote: {
      id: string;
      quoteNumber: string;
      totalKobo: number;
      status: string;
      expiresAt: string | null;
    } | null;
  }[];
  bookings: {
    id: string;
    bookingNumber: string;
    title: string;
    date: string | null;
    time: string | null;
    location: string;
    status:
      | "confirmed"
      | "assigned"
      | "en_route"
      | "arrived"
      | "in_progress"
      | "completed"
      | "cancelled";
    amountKobo: number;
    staff: { id: string; name: string }[];
    reviewNeeded: boolean;
  }[];
  activity: {
    id: string;
    title: string;
    body: string;
    time: string;
    href: string;
  }[];
};

export async function getCustomerDashboard(): Promise<CustomerDashboardData> {
  const response = await apiClient.get<CustomerDashboardData>(
    "/customer/dashboard",
  );
  return response.data;
}
