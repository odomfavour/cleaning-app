import { apiClient } from "@/lib/api/client";

export type StaffDashboardCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type StaffDashboardJobStatus =
  | "confirmed"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export type StaffDashboardJob = {
  id: string;
  bookingNumber: string;
  customerId: string;

  customer: StaffDashboardCustomer | null;

  scheduledFor: string | null;
  date: string | null;
  time: string | null;
  title: string;
  location: string;

  status: StaffDashboardJobStatus;

  amountKobo: number;

  confirmedAt: string | null;
  completedAt: string | null;
};

export type StaffJobDetail = StaffDashboardJob & {
  instructions: string;
  team: {
    id: string;
    name: string;
    role: string;
    phone: string;
  }[];
};

export type StaffDashboardStaff = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  availability: "available" | "on_job" | "off_duty";
  active: boolean;
  rating: number;
};

export type StaffDashboard = {
  staff: StaffDashboardStaff;

  stats: {
    today: number;
    upcoming: number;
    completed: number;
  };

  jobs: {
    all: StaffDashboardJob[];
    today: StaffDashboardJob[];
    upcoming: StaffDashboardJob[];
    completed: StaffDashboardJob[];
  };
};

export async function getStaffDashboard(): Promise<StaffDashboard> {
  const response = await apiClient.get<StaffDashboard>("/staff/dashboard");

  return response.data;
}

export async function updateStaffAvailability(
  availability: StaffDashboardStaff["availability"],
): Promise<StaffDashboardStaff> {
  const response = await apiClient.patch<{ staff: StaffDashboardStaff }>(
    "/staff/profile",
    { availability },
  );

  return response.data.staff;
}

export async function getStaffBooking(id: string): Promise<StaffJobDetail> {
  const response = await apiClient.get<{ booking: StaffJobDetail }>(
    `/staff/bookings/${encodeURIComponent(id)}`,
  );
  return response.data.booking;
}

export async function updateStaffBookingStatus(
  id: string,
  status: "en_route" | "arrived" | "in_progress" | "completed",
): Promise<StaffJobDetail> {
  const response = await apiClient.patch<{ booking: StaffJobDetail }>(
    `/staff/bookings/${encodeURIComponent(id)}`,
    { status },
  );
  return response.data.booking;
}
