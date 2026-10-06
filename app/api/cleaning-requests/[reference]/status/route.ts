import {
  Booking,
  CleaningRequest,
  Payment,
  Quote,
  Inspection,
} from "@/server/models";

import { connectToDatabase } from "@/server/db/connect";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

function maskEmail(email?: string) {
  if (!email) return "";

  const [local, domain] = email.split("@");

  if (!local || !domain) return "***";

  if (local.length <= 2) {
    return `${local[0] ?? "*"}***@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone?: string) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 4) return "***";

  return `***${digits.slice(-4)}`;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { reference } = await context.params;

    await connectToDatabase();

    const cleaningRequest = await CleaningRequest.findOne({
      reference: reference.trim(),
    })
      .select(
        "reference status createdAt propertyType requestedServices contactSnapshot _id",
      )
      .lean();

    if (!cleaningRequest) {
      return Response.json(
        { error: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const requestId = cleaningRequest._id;

    const [inspection, quote, booking] = await Promise.all([
      Inspection.findOne({
        requestId,
      })
        .sort({ createdAt: -1 })
        .select("status scheduledAt completedAt")
        .lean(),

      Quote.findOne({
        requestId,
      })
        .sort({ createdAt: -1 })
        .select("status sentAt expiresAt")
        .lean(),

      Booking.findOne({
        requestId,
      })
        .sort({ createdAt: -1 })
        .select("status scheduledFor")
        .lean(),
    ]);

    let payment = null;

    if (quote) {
      payment = await Payment.findOne({
        quoteId: quote._id,
      })
        .sort({ createdAt: -1 })
        .select("status paidAt")
        .lean();
    }

    const services = (cleaningRequest.requestedServices ?? []).map(
      (service: { name: string }) => service.name,
    );

    return Response.json({
      status: {
        reference: cleaningRequest.reference,
        status: cleaningRequest.status,
        submittedAt: cleaningRequest.createdAt,

        propertyType: cleaningRequest.propertyType ?? undefined,

        services,

        inspection: inspection
          ? {
              status: inspection.status,
              scheduledAt: inspection.scheduledAt,
              completedAt: inspection.completedAt ?? undefined,
            }
          : undefined,

        hasQuote: Boolean(quote),

        quoteStatus: quote?.status ?? undefined,

        quoteSentAt: quote?.sentAt ?? undefined,

        quoteExpiresAt: quote?.expiresAt ?? undefined,

        paymentStatus: payment?.status ?? undefined,

        paidAt: payment?.paidAt ?? undefined,

        hasBooking: Boolean(booking),

        bookingStatus: booking?.status ?? undefined,

        bookingScheduledFor: booking?.scheduledFor ?? undefined,

        maskedEmail: maskEmail(cleaningRequest.contactSnapshot?.email),

        maskedPhone: maskPhone(cleaningRequest.contactSnapshot?.phone),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/cleaning-requests/[reference]/status failed:",
      error,
    );

    return Response.json(
      { error: "Unable to load request status." },
      { status: 500 },
    );
  }
}
