// In-memory + localStorage "database" for the mock API. Nothing outside lib/api should import this.
import * as seed from "@/lib/mock/seed";
import type { Booking, CleaningRequest, Customer, Inspection, Notification, Payment, Quote, Review, Service, Staff } from "@/lib/types";

export interface DB {
  customers: Customer[]; staff: Staff[]; services: Service[]; requests: CleaningRequest[];
  inspections: Inspection[]; quotes: Quote[]; bookings: Booking[]; payments: Payment[];
  reviews: Review[]; notifications: Notification[]; seq: Record<string, number>;
}

const KEY = "cleanin-demo-v2";
let db: DB | null = null;

const fresh = (): DB => structuredClone({
  customers: seed.customers, staff: seed.staff, services: seed.services, requests: seed.requests,
  inspections: seed.inspections, quotes: seed.quotes, bookings: seed.bookings, payments: seed.payments,
  reviews: seed.reviews, notifications: seed.notifications,
  seq: { REQ: 1030, QT: 1025, BK: 3006, PAY: 48300, INS: 201, RV: 3, S: 7, SV: 11, N: 9, A: 2, C: 7 },
});

export function getDB(): DB {
  if (db) return db;
  if (typeof window !== "undefined") {
    try { const raw = localStorage.getItem(KEY); if (raw) return (db = JSON.parse(raw) as DB); } catch {}
  }
  return (db = fresh());
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }
export function reset() { db = fresh(); save(); }
export function nextId(prefix: keyof DB["seq"], pad = 0) {
  const d = getDB(); d.seq[prefix] = (d.seq[prefix] ?? 0) + 1;
  return pad ? `${prefix}-${String(d.seq[prefix]).padStart(pad, "0")}` : `${prefix}-${d.seq[prefix]}`;
}
export const today = () => seed.TODAY;
