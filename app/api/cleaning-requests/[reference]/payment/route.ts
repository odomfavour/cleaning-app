import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Payment, Quote } from "@/server/models";
import { canAccessCustomerRequest } from "@/server/auth/customer-request-access";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { reference: rawReference } = await context.params;
    const reference = decodeURIComponent(rawReference);
    const cleaningRequest = await CleaningRequest.findOne({ reference }).lean();

    if (!cleaningRequest) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }

    if (
      !(await canAccessCustomerRequest(
        request,
        cleaningRequest._id.toString(),
        cleaningRequest.customerId.toString(),
      ))
    ) {
      return NextResponse.json(
        { message: "Request verification or customer login is required." },
        { status: 401 },
      );
    }

    const quote = await Quote.findOne({ requestId: cleaningRequest._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!quote) {
      return NextResponse.json({ payment: null, booking: null });
    }

    const payment = await Payment.findOne({ quoteId: quote._id })
      .sort({ createdAt: -1 })
      .lean();
    const booking = payment?.bookingId
      ? await Booking.findById(payment.bookingId).lean()
      : payment?.status === "success"
        ? await Booking.findOne({ quoteId: quote._id }).lean()
        : null;

    return NextResponse.json({
      payment: payment
        ? {
            id: payment._id.toString(),
            reference: payment.reference,
            quoteId: payment.quoteId.toString(),
            amountKobo: payment.amountKobo,
            currency: payment.currency,
            status: payment.status,
            paidAt: payment.paidAt?.toISOString(),
          }
        : null,
      booking: booking
        ? {
            id: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            scheduledFor: booking.scheduledFor?.toISOString(),
            amountKobo: booking.amountKobo,
            confirmedAt: booking.confirmedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Get customer payment error:", error);
    return NextResponse.json(
      { message: "Unable to load payment status." },
      { status: 500 },
    );
  }
}