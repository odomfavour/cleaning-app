import { Types } from "mongoose";

import { Quote } from "@/server/models/Quote";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { createQuoteSchema } from "@/lib/validations/quote";
import { generateQuoteNumber } from "./quote-number.service";

function nairaToKobo(amount: number): number {
  return Math.round(amount * 100);
}

function calculateQuoteTotals(input: {
  items: {
    amount: number;
  }[];
  discount: number;
  taxRate: number;
}) {
  const subtotalKobo = input.items.reduce(
    (sum, item) => sum + nairaToKobo(item.amount),
    0,
  );

  const requestedDiscountKobo = nairaToKobo(input.discount);

  const discountKobo = Math.min(
    Math.max(0, requestedDiscountKobo),
    subtotalKobo,
  );

  const taxableKobo = Math.max(0, subtotalKobo - discountKobo);

  const taxKobo = Math.round((taxableKobo * input.taxRate) / 100);

  const totalKobo = taxableKobo + taxKobo;

  return {
    subtotalKobo,
    discountKobo,
    taxKobo,
    totalKobo,
  };
}

function getExpiryDate(value: string): Date {
  const date = new Date(`${value}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid quote expiry date.");
  }

  return date;
}

export async function createAdminQuote(input: unknown) {
  const parsed = createQuoteSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid quote data.");
  }

  const data = parsed.data;

  if (!Types.ObjectId.isValid(data.requestId)) {
    throw new Error("Invalid request ID.");
  }

  const request = await CleaningRequest.findById(data.requestId).lean();

  if (!request) {
    throw new Error("Cleaning request not found.");
  }

  const eligibleStatuses = ["new", "reviewing", "inspection_required"];

  if (!eligibleStatuses.includes(request.status)) {
    throw new Error(
      `A quote cannot be created for a request with status "${request.status}".`,
    );
  }

  if (!request.customerId) {
    throw new Error("Cleaning request has no customer.");
  }

  const totals = calculateQuoteTotals({
    items: data.items,
    discount: data.discount,
    taxRate: data.taxRate,
  });

  const expiresAt = getExpiryDate(data.validUntil);

  if (expiresAt.getTime() <= Date.now()) {
    throw new Error("Quote expiry date must be in the future.");
  }

  const items = data.items.map((item) => {
    const unitPriceKobo = nairaToKobo(item.amount);

    return {
      description: item.description.trim(),
      quantity: 1,
      unitPriceKobo,
      totalKobo: unitPriceKobo,
    };
  });

  const quote = await Quote.create({
    quoteNumber: generateQuoteNumber(),

    requestId: request._id,

    customerId: request.customerId,

    items,

    subtotalKobo: totals.subtotalKobo,

    discountKobo: totals.discountKobo,

    taxRate: data.taxRate,

    taxKobo: totals.taxKobo,

    totalKobo: totals.totalKobo,

    terms: data.terms.trim(),

    status: "sent",

    sentAt: new Date(),

    expiresAt,
  });

  /*
   * Once a quote has been sent, move the request
   * into the appropriate quote-related state.
   *
   * Adjust this status if your CleaningRequest model
   * uses a different lifecycle.
   */
  await CleaningRequest.updateOne(
    { _id: request._id },
    {
      $set: {
        status: "quoted",
      },
    },
  );

  return {
    id: quote._id.toString(),

    quoteNumber: quote.quoteNumber,

    requestId: quote.requestId.toString(),

    customerId: quote.customerId.toString(),

    items: quote.items.map((item) => ({
      id: item._id.toString(),
      description: item.description,
      quantity: item.quantity,
      unitPriceKobo: item.unitPriceKobo,
      totalKobo: item.totalKobo,
    })),

    subtotalKobo: quote.subtotalKobo,

    discountKobo: quote.discountKobo,

    taxRate: quote.taxRate,

    taxKobo: quote.taxKobo,

    totalKobo: quote.totalKobo,

    terms: quote.terms,

    status: quote.status,

    sentAt: quote.sentAt,

    expiresAt: quote.expiresAt,

    createdAt: quote.createdAt,
  };
}
