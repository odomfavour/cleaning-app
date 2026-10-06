import type { BookingStatus, InspectionStatus, PaymentStatus, QuoteStatus, RequestStatus } from "@/lib/types";

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "purple";
type Meta = Record<string, { label: string; tone: Tone }>;

export const requestStatus: Record<RequestStatus, { label: string; tone: Tone }> = {
  new: { label: "Pending", tone: "neutral" },
  under_review: { label: "Under review", tone: "info" },
  inspection_required: { label: "Inspection", tone: "purple" },
  quote_sent: { label: "Quote sent", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Quote declined", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
export const bookingStatus: Record<BookingStatus, { label: string; tone: Tone }> = {
  confirmed: { label: "Confirmed", tone: "info" },
  assigned: { label: "Staff assigned", tone: "purple" },
  en_route: { label: "En route", tone: "warning" },
  arrived: { label: "Arrived", tone: "warning" },
  in_progress: { label: "In progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
export const quoteStatus: Record<QuoteStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" }, sent: { label: "Awaiting response", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" }, declined: { label: "Declined", tone: "danger" }, expired: { label: "Expired", tone: "neutral" },
};
export const paymentStatus: Record<PaymentStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "warning" }, paid: { label: "Paid", tone: "success" },
  failed: { label: "Failed", tone: "danger" }, refunded: { label: "Refunded", tone: "neutral" },
};
export const inspectionStatus: Record<InspectionStatus, { label: string; tone: Tone }> = {
  scheduled: { label: "Scheduled", tone: "info" }, in_progress: { label: "In progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" }, cancelled: { label: "Cancelled", tone: "neutral" },
};
export const generic: Meta = {
  active: { label: "Active", tone: "success" }, inactive: { label: "Inactive", tone: "neutral" },
  available: { label: "Available", tone: "success" }, on_job: { label: "On a job", tone: "warning" }, off_duty: { label: "Off duty", tone: "neutral" },
};

export const environmentLabel: Record<string, string> = {
  house: "House", apartment: "Apartment", office: "Office", restaurant: "Restaurant",
  event_venue: "Event venue", commercial: "Commercial space", construction: "Construction site", other: "Other",
};
