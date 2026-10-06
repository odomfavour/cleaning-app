import { Types } from "mongoose";
import { Quote } from "@/server/models/Quote";

type PopulatedAdminQuote = {
  _id: { toString(): string };
  quoteNumber: string;
  requestId?: {
    _id: { toString(): string };
    reference: string;
    contactSnapshot?: { name?: string; email?: string; phone?: string };
    requestedServices?: { serviceId: { toString(): string }; name: string }[];
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    propertyDetails?: Record<string, unknown>;
    notes?: string;
    photos?: string[];
    address?: {
      addressLine1?: string;
      city?: string;
      area?: string;
      landmark?: string;
      directions?: string;
    };
    preferredDate?: Date;
    preferredTimeSlot?: string;
    schedule?: {
      alternativeDate?: Date;
      alternativeTimeSlot?: string;
      flexible?: boolean;
    };
    status: string;
    createdAt?: Date;
  } | null;
  customerId?: {
    _id: { toString(): string };
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  items: {
    _id: { toString(): string };
    description: string;
    quantity: number;
    unitPriceKobo: number;
    totalKobo: number;
  }[];
  subtotalKobo: number;
  discountKobo: number;
  taxRate?: number;
  taxKobo?: number;
  totalKobo: number;
  status: string;
  sentAt?: Date;
  expiresAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
};

function serializeQuote(quote: PopulatedAdminQuote) {
  const request = quote.requestId;
  const customer = quote.customerId;

  return {
    id: quote._id.toString(),
    quoteNumber: quote.quoteNumber,

    request: request
      ? {
          id: request._id.toString(),
          reference: request.reference,

          contact: {
            name: request.contactSnapshot?.name ?? "",
            email: request.contactSnapshot?.email ?? "",
            phone: request.contactSnapshot?.phone ?? "",
          },

          requestedServices:
            request.requestedServices?.map((service) => ({
              serviceId: service.serviceId.toString(),
              name: service.name,
            })) ?? [],

          property: {
            propertyType: request.propertyType ?? "",
            bedrooms: request.bedrooms ?? 0,
            bathrooms: request.bathrooms ?? 0,
            ...(request.propertyDetails ?? {}),
          },

          description: request.notes ?? "",
          specialRequirements: "",
          attentionAreas: "",

          photos: request.photos ?? [],

          location: {
            address: request.address?.addressLine1 ?? "",
            city: request.address?.city ?? "",
            area: request.address?.area ?? "",
            landmark: request.address?.landmark ?? "",
            directions: request.address?.directions ?? "",
          },

          preferred: {
            date: request.preferredDate
              ? request.preferredDate.toISOString()
              : "",

            time: request.preferredTimeSlot ?? "",

            altDate: request.schedule?.alternativeDate
              ? request.schedule.alternativeDate.toISOString()
              : undefined,

            altTime: request.schedule?.alternativeTimeSlot ?? undefined,

            flexible: request.schedule?.flexible ?? false,
          },

          status: request.status,
          submittedAt: request.createdAt ? request.createdAt.toISOString() : "",
        }
      : null,

    customer: customer
      ? {
          id: customer._id.toString(),

          name:
            `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
            request?.contactSnapshot?.name ||
            "Unknown customer",

          email: customer.email ?? request?.contactSnapshot?.email,

          phone: customer.phone ?? request?.contactSnapshot?.phone,
        }
      : null,

    items: quote.items.map((item) => ({
      id: item._id.toString(),
      description: item.description,
      quantity: item.quantity,
      unitPriceKobo: item.unitPriceKobo,
      totalKobo: item.totalKobo,
    })),

    subtotalKobo: quote.subtotalKobo,
    discountKobo: quote.discountKobo,
    taxRate: quote.taxRate ?? 0,
    taxKobo: quote.taxKobo ?? 0,
    totalKobo: quote.totalKobo,

    status: quote.status,

    sentAt: quote.sentAt?.toISOString(),
    expiresAt: quote.expiresAt?.toISOString(),
    acceptedAt: quote.acceptedAt?.toISOString(),
    declinedAt: quote.declinedAt?.toISOString(),

    terms: quote.terms,

    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  };
}

const requestPopulate = {
  path: "requestId",
  select: `
    _id
    reference
    customerId
    contactSnapshot
    requestedServices
    address
    propertyType
    bedrooms
    bathrooms
    propertyDetails
    preferredDate
    preferredTimeSlot
    schedule
    notes
    photos
    status
    createdAt
  `,
};
// test
const customerPopulate = {
  path: "customerId",
  select: "_id firstName lastName email phone",
};

export async function getAdminQuotes() {
  const quotes = await Quote.find({})
    .populate(requestPopulate)
    .populate(customerPopulate)
    .sort({ createdAt: -1 })
    .lean();

  return quotes.map(serializeQuote);
}

export async function getAdminQuoteById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid quote ID.");
  }

  const quote = await Quote.findById(id)
    .populate(requestPopulate)
    .populate(customerPopulate)
    .lean();

  if (!quote) {
    throw new Error("Quote not found.");
  }

  return serializeQuote(quote);
}
