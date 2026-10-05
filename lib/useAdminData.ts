"use client";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";

/** Loads every collection the admin screens join across, with lookup helpers. */
export function useAdminData() {
  const res = useApi(async () => {
    const [customers, staff, services, requests, inspections, quotes, bookings, payments, reviews] = await Promise.all([
      api.customers.getAll(), api.staff.getAll(), api.services.getAll(), api.requests.getAll(), api.inspections.getAll(),
      api.quotes.getAll(), api.bookings.getAll(), api.payments.getAll(), api.reviews.getAll(),
    ]);
    return { customers, staff, services, requests, inspections, quotes, bookings, payments, reviews };
  });
  const d = res.data;
  const L = {
    customer: (id?: string) => d?.customers.find((c) => c.id === id),
    request: (id?: string) => d?.requests.find((r) => r.id === id),
    quote: (id?: string) => d?.quotes.find((q) => q.id === id),
    booking: (id?: string) => d?.bookings.find((b) => b.id === id),
    staff: (id?: string) => d?.staff.find((s) => s.id === id),
    inspection: (id?: string) => d?.inspections.find((i) => i.id === id),
    payment: (id?: string) => d?.payments.find((p) => p.id === id),
  };
  return { ...res, d, L };
}
