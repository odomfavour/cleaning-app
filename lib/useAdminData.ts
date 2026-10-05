"use client";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getAdminWorkspace } from "@/lib/api/services/admin-workspace.service";

/** Loads the authenticated admin workspace with lookup helpers for existing screens. */
export function useAdminData() {
  const query = useQuery({
    queryKey: ["admin-workspace"],
    queryFn: getAdminWorkspace,
  });
  const d = query.data;
  const L = {
    customer: (id?: string) => d?.customers.find((c) => c.id === id),
    request: (id?: string) => d?.requests.find((r) => r.id === id),
    quote: (id?: string) => d?.quotes.find((q) => q.id === id),
    booking: (id?: string) => d?.bookings.find((b) => b.id === id),
    staff: (id?: string) => d?.staff.find((s) => s.id === id),
    inspection: (id?: string) => d?.inspections.find((i) => i.id === id),
    payment: (id?: string) => d?.payments.find((p) => p.id === id),
  };
  return {
    d,
    L,
    loading: query.isLoading,
    error: query.error ? getApiErrorMessage(query.error) : null,
    reload: () => void query.refetch(),
  };
}
