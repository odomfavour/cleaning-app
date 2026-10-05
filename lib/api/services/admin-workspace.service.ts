import { apiClient } from "@/lib/api/client";
import type {
  Booking,
  BookingStatus,
  CleaningRequest,
  Customer,
  Inspection,
  Payment,
  Quote,
  Review,
  Service,
  Staff,
} from "@/lib/types";

export type WorkspaceQuote = Quote & {
  requestId: string;
  customerId: string;
  discount: number;
  validUntil: string;
};

export type WorkspaceBooking = Omit<Booking, "status"> & {
  status: BookingStatus | "staff_assigned";
  completedAt?: string;
};

export type AdminWorkspaceData = {
  customers: Customer[];
  staff: Staff[];
  services: Service[];
  requests: (CleaningRequest & { services: string[] })[];
  inspections: Inspection[];
  quotes: WorkspaceQuote[];
  bookings: WorkspaceBooking[];
  payments: Payment[];
  reviews: Review[];
};

export async function getAdminWorkspace(): Promise<AdminWorkspaceData> {
  const response = await apiClient.get<AdminWorkspaceData>("/admin/workspace");
  return response.data;
}