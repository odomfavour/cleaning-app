import { apiClient } from "@/lib/api/client";

export type AdminDashboardData = {
  stats: {
    requestsToday: number;
    needsQuote: number;
    upcomingBookings: number;
    unassignedBookings: number;
    completedBookings: number;
    paidRevenueKobo: number;
  };
  requests: {
    id: string;
    reference: string;
    customer: string;
    services: string[];
    status: string;
    submittedAt: string;
  }[];
  bookings: {
    id: string;
    bookingNumber: string;
    title: string;
    status: string;
    scheduledFor: string | null;
    preferredTime: string | null;
    customer: string;
    unassigned: boolean;
  }[];
  weeklyRevenue: { label: string; value: number }[];
  activity: { id: string; title: string; customer: string; at: string }[];
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiClient.get<AdminDashboardData>("/admin/dashboard");
  return response.data;
}
