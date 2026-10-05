export type Role = "customer" | "admin" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}
export interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  area: string;
}
export interface Customer extends User {
  role: "customer";
  status: "active" | "inactive";
  joinedAt: string;
  addresses: Address[];
  /** false = guest: created from a public request, no password yet. Must verify email/phone to view quotes. */
  hasAccount: boolean;
}
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}
export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "Cleaner" | "Team Lead" | "Inspector" | "Driver";
  availability: "available" | "on_job" | "off_duty";
  status: "active" | "inactive";
  activeJobs: number;
  completedJobs: number;
  rating: number;
}
export interface Service {
  id: string;
  name: string;
  description: string;
  guidance: string;
  duration: string;
  active: boolean;
}

export type Environment =
  | "house"
  | "apartment"
  | "office"
  | "restaurant"
  | "event_venue"
  | "commercial"
  | "construction"
  | "other";

export type RequestStatus =
  | "new"
  | "under_review"
  | "inspection_required"
  | "quote_sent"
  | "accepted"
  | "declined"
  | "rejected"
  | "completed"
  | "cancelled";

export interface CleaningRequest {
  id: string;
  customerId: string;
  contact: ContactInfo;
  environment: Environment;
  requestedServices: {
    serviceId: string;
    name: string;
  }[];

  property: Record<string, string | number | boolean>;

  description: string;
  specialRequirements: string;
  attentionAreas: string;
  photos: string[];

  location: {
    address: string;
    city: string;
    area: string;
    landmark: string;
    directions: string;
  };

  preferred: {
    date: string;
    time: string;
    altDate?: string;
    altTime?: string;
    flexible?: boolean;
  };

  status: RequestStatus;
  submittedAt: string;

  inspectionId?: string;
  quoteId?: string;
  bookingId?: string;
  adminNote?: string;
}

export type InspectionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export interface InspectionReport {
  condition: string;
  size: string;
  duration: string;
  additionalServices: string;
  specialRequirements: string;
  notes: string;
  photos: string[];
}
export interface Inspection {
  id: string;
  requestId: string;
  inspectorId: string;
  date: string;
  time: string;
  status: InspectionStatus;
  report?: InspectionReport;
}

export interface QuoteItem {
  id: string;
  description: string;
  amount: number;
}
export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "expired";
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;

  request: CleaningRequest | null;
  customer: Pick<Customer, "id" | "name" | "email" | "phone"> | null;

  items: QuoteItem[];

  subtotalKobo: number;
  discountKobo: number;
  taxRate: number;
  taxKobo: number;
  totalKobo: number;

  status: QuoteStatus;

  sentAt?: string;
  expiresAt?: string;
  acceptedAt?: string;
  declinedAt?: string;

  terms: string;

  createdAt: string;
  updatedAt: string;
}
export type BookingStatus =
  | "confirmed"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  requestId: string;
  quoteId: string;
  customerId: string;
  title: string;
  location: string;
  date: string;
  time: string;
  durationHrs: number;
  staffIds: string[];
  status: BookingStatus;
  amount: number;
  paymentId?: string;
  instructions?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  reviewId?: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "bank_transfer" | "ussd";
export interface Payment {
  id: string;
  reference: string;
  customerId: string;
  quoteId: string;
  bookingId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  photos: string[];
}
export interface Notification {
  id: string;
  audience: Role;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

/** What anyone holding a reference may see. No names, addresses or amounts. */
export interface PublicRequestStatus {
  reference: string;
  status: RequestStatus;
  services: string[];
  environment: Environment;
  submittedAt: string;
  maskedEmail: string;
  maskedPhone: string;
  inspection?: InspectionStatus;
  hasQuote: boolean;
  quoteStatus?: QuoteStatus;
  hasBooking: boolean;
}
export interface AccessSession {
  customerId: string;
  method: "account" | "verified";
}

export type AuthRole = "customer" | "admin" | "staff";
