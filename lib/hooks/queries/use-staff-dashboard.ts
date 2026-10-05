import { useQuery } from "@tanstack/react-query";

import { getStaffDashboard } from "@/lib/api/services/staff-dashboard.service";

export const staffDashboardKeys = {
  all: ["staff", "dashboard"] as const,
};

export function useStaffDashboard() {
  return useQuery({
    queryKey: staffDashboardKeys.all,
    queryFn: getStaffDashboard,
  });
}
