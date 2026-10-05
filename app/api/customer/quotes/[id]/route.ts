import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Payment, Quote } from "@/server/models";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function loadCustomerQuote(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: NextResponse.json({ message: "Login required." }, { status: 401 }) };
  }

  if (user.role !== "customer" || !user.customerId) {
    return { error: NextResponse.json({ message: "Customer access required." }, { status: 403 }) };
  }

  if (!Types.ObjectId.isValid(id)) {
    return { error: NextResponse.json({ message: "Quote not found." }, { status: 404 }) };
  }

  const quote = await Quote.findOne({ _id: id, customerId: user.customerId });

  if (!quote) {
    return { error: NextResponse.json({ message: "Quote not found." }, { status: 404 }) };
  }

  const request = await CleaningRequest.findOne({
    _id: quote.requestId,
    customerId: user.customerId,
  });

  if (!request) {
    return { error: NextResponse.json({ message: "Request not found." }, { status: 404 }) };
  }

  return { quote, request };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const result = await loadCustomerQuote(id);

    if ("error" in result) return result.error;

    const { quote, request } = result;

    if (quote.status === "sent" && quote.expiresAt && quote.expiresAt <= new Date()) {
      quote.status = "expired";
      await quote.save();
    }

    const [booking, payment] = await Promise.all([
      Booking.findOne({ quoteId: quote._id }).lean(),
      Payment.findOne({ quoteId: quote._id, status: "success" }).lean(),
    ]);

    return NextResponse.json({
      quote: {
        id: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        requestReference: request.reference,
        items: quote.items.map((item: {
          _id: Types.ObjectId;
          description: string;
          quantity: number;
          unitPriceKobo: number;
          totalKobo: number;
        }) => ({
          id: item._id.toString(),
          description: item.description,
          quantity: item.quantity,
          unitPriceKobo: item.unitPriceKobo,
          totalKobo: item.totalKobo,
        })),
        subtotalKobo: quote.subtotalKobo,
        discountKobo: quote.discountKobo,
        totalKobo: quote.totalKobo,
        status: quote.status,
        sentAt: quote.sentAt?.toISOString(),
        expiresAt: quote.expiresAt?.toISOString(),
        acceptedAt: quote.acceptedAt?.toISOString(),
      },
      request: {
        services: request.requestedServices.map(
          (service: { name: string }) => service.name,
        ),
        address: [request.address.addressLine1, request.address.area, request.address.city]
          .filter(Boolean)
          .join(", "),
        preferredDate: request.preferredDate?.toISOString(),
        preferredTimeSlot: request.preferredTimeSlot,
      },
      booking: booking
        ? {
            id: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            confirmedAt: booking.confirmedAt.toISOString(),
          }
        : null,
      paymentStatus: payment?.status ?? null,
    });
  } catch (error) {
    console.error("GET customer quote failed:", error);
    return NextResponse.json({ message: "Unable to load quote." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const result = await loadCustomerQuote(id);

    if ("error" in result) return result.error;

    const body = (await request.json()) as { action?: string };
    const now = new Date();

    if (body.action !== "accept" && body.action !== "decline") {
      return NextResponse.json({ message: "Invalid quote action." }, { status: 400 });
    }

    if (result.quote.status !== "sent") {
      return NextResponse.json({ message: "This quote can no longer be changed." }, { status: 409 });
    }

    if (result.quote.expiresAt && result.quote.expiresAt <= now) {
      result.quote.status = "expired";
      await result.quote.save();
      return NextResponse.json({ message: "This quote has expired." }, { status: 409 });
    }

    result.quote.status = body.action === "accept" ? "accepted" : "declined";
    if (body.action === "accept") result.quote.acceptedAt = now;
    else result.quote.declinedAt = now;
    await result.quote.save();

    result.request.status = body.action === "accept" ? "accepted" : "declined";
    await result.request.save();

    return NextResponse.json({
      quote: {
        id: result.quote._id.toString(),
        quoteNumber: result.quote.quoteNumber,
        requestReference: result.request.reference,
        totalKobo: result.quote.totalKobo,
        status: result.quote.status,
        acceptedAt: result.quote.acceptedAt?.toISOString(),
        declinedAt: result.quote.declinedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH customer quote failed:", error);
    return NextResponse.json({ message: "Unable to update quote." }, { status: 500 });
  }
}