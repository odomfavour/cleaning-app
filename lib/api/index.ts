/**
 * Mock API. Shape mirrors the REST resources a real backend will expose, so swapping in
 * `fetch("/api/requests")` later only means re-implementing this file. UI code should only import `api`.
 */
import { CURRENT_CUSTOMER_ID, CURRENT_STAFF_ID, TERMS } from "@/lib/mock/seed";
import type { AccessSession, ContactInfo, PublicRequestStatus } from "@/lib/types";
import { delay } from "@/lib/utils";
import type {
  Booking, BookingStatus, CleaningRequest, Customer, Inspection, InspectionReport, Notification, Payment,
  PaymentMethod, Quote, QuoteItem, RequestStatus, Review, Role, Service, Staff,
} from "@/lib/types";
import { getDB, nextId, reset, save, today } from "./db";
import { quoteTotals } from "@/lib/quote";

const run = async <T>(fn: () => T, ms = 380): Promise<T> => {
  await delay(ms);
  const out = fn();
  return out === undefined ? out : structuredClone(out);
};
const find = <T extends { id: string }>(list: T[], id: string, what: string) => {
  const x = list.find((i) => i.id === id);
  if (!x) throw new Error(`${what} ${id} not found`);
  return x;
};
/** Notify a customer in-app only if they have an account. Guests are notified by email/SMS (backend job later). */
const notifyCustomer = (customerId: string, title: string, body: string, href?: string) => {
  if (getDB().customers.find((c) => c.id === customerId)?.hasAccount) notify("customer", title, body, href);
};
const notify = (audience: Role, title: string, body: string, href?: string) => {
  const d = getDB();
  d.notifications.unshift({ id: nextId("N"), audience, title, body, time: new Date().toISOString(), read: false, href });
};


// ---- session (mock). A real backend replaces this with an httpOnly cookie. ----
const SESSION_KEY = "cleanin-session-v1";
const readSession = (): AccessSession => {
  try { const raw = typeof window !== "undefined" && localStorage.getItem(SESSION_KEY); if (raw) return JSON.parse(raw) as AccessSession; } catch {}
  return { customerId: CURRENT_CUSTOMER_ID, method: "account" }; // demo default: logged in as the seeded customer
};
const writeSession = (s: AccessSession) => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {} };

const maskEmail = (e: string) => { const [u, d] = e.split("@"); return `${u[0]}${"•".repeat(Math.max(u.length - 1, 2))}@${d}`; };
const maskPhone = (p: string) => { const digits = p.replace(/\D/g, ""); return `+${digits.slice(0, 3)} ••• ••• ${digits.slice(-4)}`; };
export const DEMO_CODE = "123456";
const norm = (s: string) => s.trim().toLowerCase();

const findCustomerByContact = (c: ContactInfo) => getDB().customers.find((x) => norm(x.email) === norm(c.email));

export const api = {
  session: {
    get customerId() { return readSession().customerId; },
    get method() { return readSession().method; },
    staffId: CURRENT_STAFF_ID,
    /** True when the browser may view this customer's quotes, payments and bookings. */
    canAccess: (customerId: string) => readSession().customerId === customerId,
    signOut: () => { try { localStorage.removeItem(SESSION_KEY); } catch {} },
  },
  resetDemo: () => { reset(); },

  /** Public tracking + verification. These map to unauthenticated Route Handlers; everything else requires a session. */
  access: {
    /** Safe summary for anyone holding a reference. Never returns names, addresses, photos or amounts. */
    getPublicStatus: (reference: string) => run((): PublicRequestStatus | null => {
      const d = getDB(); const r = d.requests.find((x) => x.id.toLowerCase() === norm(reference));
      if (!r) return null;
      const quote = d.quotes.find((q) => q.id === r.quoteId); const ins = d.inspections.find((i) => i.id === r.inspectionId);
      return { reference: r.id, status: r.status, services: r.services, environment: r.environment, submittedAt: r.submittedAt,
        maskedEmail: maskEmail(r.contact.email), maskedPhone: maskPhone(r.contact.phone), inspection: ins?.status, hasQuote: !!quote, quoteStatus: quote?.status, hasBooking: !!r.bookingId };
    }, 500),
    sendCode: (reference: string, channel: "email" | "phone") => run(() => {
      const r = getDB().requests.find((x) => x.id.toLowerCase() === norm(reference));
      if (!r) throw new Error("We couldn't find that request.");
      return { sentTo: channel === "email" ? maskEmail(r.contact.email) : maskPhone(r.contact.phone) };
    }, 800),
    /** Real backend: check a one-time code (hashed, expiring, rate-limited), then set a session cookie. */
    verify: (reference: string, code: string) => run(() => {
      const r = getDB().requests.find((x) => x.id.toLowerCase() === norm(reference));
      if (!r) throw new Error("We couldn't find that request.");
      if (code.trim() !== DEMO_CODE) throw new Error("That code isn't right. Check the code and try again.");
      writeSession({ customerId: r.customerId, method: "verified" });
      return { customerId: r.customerId };
    }, 700),
    /** Full request, only if this browser's session owns it. */
    getVerifiedRequest: (reference: string) => run(() => {
      const r = getDB().requests.find((x) => x.id.toLowerCase() === norm(reference));
      if (!r) throw new Error("Request not found");
      if (readSession().customerId !== r.customerId) throw new Error("Verification required");
      return r;
    }, 400),
  },

  auth: {
    login: (email: string, password: string) => run(() => {
      if (password === "wrong") throw new Error("Incorrect email or password. Check your details and try again.");
      const role: Role = email.includes("admin") ? "admin" : email.includes("staff") ? "staff" : "customer";
      if (role === "customer") {
        const known = getDB().customers.find((c) => norm(c.email) === norm(email) && c.hasAccount);
        writeSession({ customerId: known?.id ?? CURRENT_CUSTOMER_ID, method: "account" });
      }
      return { role, redirect: role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard" };
    }, 700),
    register: (input: { name: string; email: string; phone: string; password: string }) => run(() => {
      if (input.email.toLowerCase() === "taken@example.com") throw new Error("An account with this email already exists. Try logging in instead.");
      const d = getDB();
      // A guest who requested earlier with this email is "claimed" by the new account (real backend: only after email verification).
      let c = d.customers.find((x) => norm(x.email) === norm(input.email));
      if (c) { c.hasAccount = true; c.name = input.name; c.phone = input.phone; }
      else { c = { id: nextId("C").toLowerCase(), name: input.name, email: input.email, phone: input.phone, role: "customer", hasAccount: true, status: "active", joinedAt: today(), addresses: [] }; d.customers.push(c); }
      save(); writeSession({ customerId: c.id, method: "account" });
      return { id: c.id, ...input };
    }, 900),
    forgotPassword: (email: string) => run(() => email.length > 0, 700),
  },

  customers: {
    getAll: () => run(() => getDB().customers),
    getById: (id: string) => run(() => find(getDB().customers, id, "Customer")),
    me: () => run(() => find(getDB().customers, readSession().customerId, "Customer")),
    update: (id: string, patch: Partial<Customer>) => run(() => { const c = find(getDB().customers, id, "Customer"); Object.assign(c, patch); save(); return c; }),
    addAddress: (id: string, a: Omit<Customer["addresses"][number], "id">) => run(() => { const c = find(getDB().customers, id, "Customer"); c.addresses.push({ ...a, id: nextId("A") }); save(); return c; }),
    removeAddress: (id: string, addrId: string) => run(() => { const c = find(getDB().customers, id, "Customer"); c.addresses = c.addresses.filter((a) => a.id !== addrId); save(); return c; }),
  },

  services: {
    getAll: () => run(() => getDB().services),
    create: (s: Omit<Service, "id">) => run(() => { const n = { ...s, id: nextId("SV").toLowerCase() }; getDB().services.push(n); save(); return n; }),
    update: (id: string, patch: Partial<Service>) => run(() => { const s = find(getDB().services, id, "Service"); Object.assign(s, patch); save(); return s; }, 200),
  },

  requests: {
    getAll: (f?: { customerId?: string }) => run(() => getDB().requests.filter((r) => !f?.customerId || r.customerId === f.customerId).sort((a, b) => b.id.localeCompare(a.id))),
    getById: (id: string) => run(() => find(getDB().requests, id, "Request")),
    /** Works with or without an account. Guests get a customer record created from their contact details. */
    create: (input: Omit<CleaningRequest, "id" | "status" | "submittedAt" | "customerId"> & { customerId?: string }) => run(() => {
      const d = getDB();
      let customerId = input.customerId;
      if (!customerId) {
        let c = findCustomerByContact(input.contact);
        if (!c) { c = { id: nextId("C").toLowerCase(), name: input.contact.name, email: input.contact.email, phone: input.contact.phone, role: "customer", hasAccount: false, status: "active", joinedAt: today(), addresses: [] }; d.customers.push(c); }
        customerId = c.id;
      }
      const r: CleaningRequest = { ...input, customerId, id: nextId("REQ"), status: "new", submittedAt: today() };
      d.requests.unshift(r);
      notify("admin", `New request ${r.id}`, `${input.contact.name}: ${r.services.join(", ")}${input.customerId ? "" : " (guest)"}`, `/admin/requests/${r.id}`);
      save(); return r;
    }, 900),
    setStatus: (id: string, status: RequestStatus, adminNote?: string) => run(() => {
      const r = find(getDB().requests, id, "Request"); r.status = status; if (adminNote) r.adminNote = adminNote;
      if (status === "under_review" || status === "rejected") notifyCustomer(r.customerId, status === "rejected" ? "Request not accepted" : "We're reviewing your request", `${r.id}`, `/dashboard/requests/${r.id}`);
      save(); return r;
    }),
    cancel: (id: string) => run(() => { const r = find(getDB().requests, id, "Request"); r.status = "cancelled"; save(); return r; }),
  },

  inspections: {
    getAll: () => run(() => getDB().inspections),
    getById: (id: string) => run(() => find(getDB().inspections, id, "Inspection")),
    schedule: (i: { requestId: string; inspectorId: string; date: string; time: string }) => run(() => {
      const d = getDB(); const r = find(d.requests, i.requestId, "Request");
      const ins: Inspection = { ...i, id: nextId("INS"), status: "scheduled" };
      d.inspections.unshift(ins); r.status = "inspection_required"; r.inspectionId = ins.id;
      notifyCustomer(r.customerId, "Inspection scheduled", `We'll visit on ${i.date} at ${i.time}.`, `/dashboard/requests/${r.id}`);
      save(); return ins;
    }),
    setStatus: (id: string, status: Inspection["status"]) => run(() => { const i = find(getDB().inspections, id, "Inspection"); i.status = status; save(); return i; }),
    complete: (id: string, report: InspectionReport) => run(() => { const i = find(getDB().inspections, id, "Inspection"); i.status = "completed"; i.report = report; save(); return i; }, 700),
  },

  quotes: {
    getAll: () => run(() => getDB().quotes),
    getById: (id: string) => run(() => find(getDB().quotes, id, "Quote")),
    create: (q: { requestId: string; items: QuoteItem[]; discount: number; taxRate: number; validUntil: string; terms?: string }) => run(() => {
      const d = getDB(); const r = find(d.requests, q.requestId, "Request");
      const quote: Quote = { ...q, terms: q.terms || TERMS, id: nextId("QT"), customerId: r.customerId, status: "sent", createdAt: today() };
      d.quotes.unshift(quote); r.status = "quote_sent"; r.quoteId = quote.id;
      notifyCustomer(r.customerId, "Your quote is ready", `${quote.id} for ${r.id} is waiting for your response.`, `/dashboard/quotes/${quote.id}`);
      save(); return quote;
    }, 800),
    accept: (id: string) => run(() => { const d = getDB(); const q = find(d.quotes, id, "Quote"); q.status = "accepted"; find(d.requests, q.requestId, "Request").status = "accepted"; save(); return q; }),
    decline: (id: string) => run(() => { const d = getDB(); const q = find(d.quotes, id, "Quote"); q.status = "declined"; find(d.requests, q.requestId, "Request").status = "declined"; save(); return q; }),
  },

  payments: {
    getAll: () => run(() => getDB().payments.sort((a, b) => b.date.localeCompare(a.date))),
    /** Mock checkout. `outcome` lets the UI demo success and failure. A real gateway call goes here later. */
    pay: (quoteId: string, method: PaymentMethod, outcome: "success" | "failure" = "success") => run(() => {
      const d = getDB(); const q = find(d.quotes, quoteId, "Quote"); const r = find(d.requests, q.requestId, "Request");
      const payment: Payment = { id: nextId("PAY").toLowerCase(), reference: nextId("PAY"), customerId: q.customerId, quoteId, amount: quoteTotals(q).total, method, date: today(), status: outcome === "success" ? "paid" : "failed" };
      d.payments.unshift(payment);
      if (outcome === "failure") { save(); return { payment, booking: undefined as Booking | undefined }; }
      const booking: Booking = {
        id: nextId("BK"), requestId: r.id, quoteId, customerId: q.customerId, title: r.services[0] ?? "Cleaning",
        location: `${r.location.address}${r.location.area ? ", " + r.location.area : ""}`, date: r.preferred.date, time: r.preferred.time,
        durationHrs: 4, staffIds: [], status: "confirmed", amount: payment.amount, paymentId: payment.id,
        instructions: [r.specialRequirements, r.location.directions].filter(Boolean).join(". "),
      };
      payment.bookingId = booking.id; d.bookings.unshift(booking); r.bookingId = booking.id;
      notify("admin", "Booking confirmed", `${booking.id} is paid and needs staff.`, `/admin/bookings/${booking.id}`);
      save(); return { payment, booking };
    }, 1600),
  },

  bookings: {
    getAll: (f?: { customerId?: string; staffId?: string }) => run(() => getDB().bookings.filter((b) => (!f?.customerId || b.customerId === f.customerId) && (!f?.staffId || b.staffIds.includes(f.staffId))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))),
    getById: (id: string) => run(() => find(getDB().bookings, id, "Booking")),
    assignStaff: (id: string, staffIds: string[]) => run(() => {
      const b = find(getDB().bookings, id, "Booking"); b.staffIds = staffIds;
      if (b.status === "confirmed" && staffIds.length) b.status = "staff_assigned";
      if (b.status === "staff_assigned" && !staffIds.length) b.status = "confirmed";
      if (staffIds.length) notifyCustomer(b.customerId, "Staff assigned", `Your cleaning team for ${b.id} is confirmed.`, `/dashboard/bookings/${b.id}`);
      save(); return b;
    }),
    setStatus: (id: string, status: BookingStatus) => run(() => { const b = find(getDB().bookings, id, "Booking"); b.status = status; save(); return b; }, 500),
    complete: (id: string, photos: { before: string[]; after: string[] }) => run(() => {
      const d = getDB(); const b = find(d.bookings, id, "Booking"); b.status = "completed"; b.beforePhotos = photos.before; b.afterPhotos = photos.after;
      find(d.requests, b.requestId, "Request").status = "completed";
      notifyCustomer(b.customerId, "Cleaning completed", `How did we do? Leave a review for ${b.id}.`, `/dashboard/bookings/${b.id}/review`);
      save(); return b;
    }, 900),
    cancel: (id: string) => run(() => { const b = find(getDB().bookings, id, "Booking"); b.status = "cancelled"; save(); return b; }),
  },

  reviews: {
    getAll: () => run(() => getDB().reviews.sort((a, b) => b.date.localeCompare(a.date))),
    create: (r: { bookingId: string; rating: number; comment: string; photos: string[] }) => run(() => {
      const d = getDB(); const b = find(d.bookings, r.bookingId, "Booking");
      const review: Review = { ...r, id: nextId("RV").toLowerCase(), customerId: b.customerId, service: b.title, date: today() };
      d.reviews.unshift(review); b.reviewId = review.id; save(); return review;
    }, 800),
  },

  staff: {
    getAll: () => run(() => getDB().staff),
    getById: (id: string) => run(() => find(getDB().staff, id, "Staff member")),
    create: (s: Omit<Staff, "id" | "activeJobs" | "completedJobs" | "rating" | "status">) => run(() => {
      const n: Staff = { ...s, id: nextId("S").toLowerCase(), activeJobs: 0, completedJobs: 0, rating: 0, status: "active" }; getDB().staff.push(n); save(); return n;
    }),
    update: (id: string, patch: Partial<Staff>) => run(() => { const s = find(getDB().staff, id, "Staff member"); Object.assign(s, patch); save(); return s; }, 250),
  },

  notifications: {
    getAll: (audience: Role) => run(() => getDB().notifications.filter((n) => n.audience === audience).sort((a, b) => b.time.localeCompare(a.time)), 150),
    markAllRead: (audience: Role) => run(() => { getDB().notifications.forEach((n) => { if (n.audience === audience) n.read = true; }); save(); return true; }, 100),
  },
};
export type Api = typeof api;
export type { Notification };
