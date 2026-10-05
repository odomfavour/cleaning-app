import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Payment, Quote } from "@/server/models";
import { canAccessCustomerRequest } from "@/server/auth/customer-request-access";
import { generateBookingNumber } from "@/server/utils/generate-booking-number";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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
      return NextResponse.json({ message: "Quote not found." }, { status: 404 });
    }

    const payment = await Payment.findOne({
      quoteId: quote._id,
      provider: "paystack",
    }).sort({ createdAt: -1 });

    if (!payment) {
      return NextResponse.json(
        {
          message: "Payment not found",
        },
        { status: 404 },
      );
    }

    if (payment.status !== "success") {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!secretKey) {
        return NextResponse.json(
          { message: "Payment is not configured on the server." },
          { status: 503 },
        );
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment.reference)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${secretKey}` },
        },
      );
      const result = await response.json();

      if (!response.ok || !result.status) {
        return NextResponse.json(
          { message: result?.message ?? "Unable to verify payment." },
          { status: 502 },
        );
      }

      const transaction = result.data;

      if (transaction.status !== "success") {
        payment.status = transaction.status === "abandoned" ? "abandoned" : "failed";
        payment.providerPayload = { verification: transaction };
        await payment.save();

        return NextResponse.json(
          { message: "Payment has not been completed.", status: transaction.status },
          { status: 409 },
        );
      }

      if (transaction.reference !== payment.reference) {
        return NextResponse.json(
          { message: "Payment reference could not be verified." },
          { status: 400 },
        );
      }

      if (Number(transaction.amount) !== payment.amountKobo) {
        payment.status = "failed";
        payment.failureReason = "Payment amount mismatch.";
        payment.providerPayload = { verification: transaction };
        await payment.save();

        return NextResponse.json(
          { message: "Payment amount could not be verified." },
          { status: 400 },
        );
      }

      if (transaction.currency !== payment.currency) {
        payment.status = "failed";
        payment.failureReason = "Payment currency mismatch.";
        payment.providerPayload = { verification: transaction };
        await payment.save();

        return NextResponse.json(
          { message: "Payment currency could not be verified." },
          { status: 400 },
        );
      }

      payment.status = "success";
      payment.paidAt = new Date(transaction.paid_at ?? Date.now());
      payment.paidAmountKobo = Number(transaction.amount);
      payment.providerTransactionId = String(transaction.id);
      payment.providerPayload = { verification: transaction };
      await payment.save();
    }

    const booking = await Booking.findOneAndUpdate(
      { quoteId: quote._id },
      {
        $setOnInsert: {
          bookingNumber: generateBookingNumber(),
          requestId: cleaningRequest._id,
          quoteId: quote._id,
          customerId: payment.customerId,
          paymentReference: payment.reference,
          amountKobo: payment.amountKobo,
          confirmedAt: payment.paidAt ?? new Date(),
          status: "confirmed",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!payment.bookingId || payment.bookingId.toString() !== booking._id.toString()) {
      payment.bookingId = booking._id;
      await payment.save();
    }

    if (cleaningRequest.status !== "converted") {
      await CleaningRequest.updateOne(
        { _id: cleaningRequest._id },
        { $set: { status: "converted" } },
      );
    }

    return NextResponse.json({
      payment: {
        id: payment._id.toString(),
        reference: payment.reference,
        quoteId: payment.quoteId.toString(),
        amountKobo: payment.amountKobo,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt?.toISOString(),
      },

      booking: {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        scheduledFor: booking.scheduledFor?.toISOString(),
        amountKobo: booking.amountKobo,
        confirmedAt: booking.confirmedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Verify customer payment error:", error);

    return NextResponse.json(
      {
        message: "Unable to verify payment.",
      },
      { status: 500 },
    );
  }
}
