import { connectToDatabase } from "@/server/db/connect";
import { Booking } from "@/server/models/Booking";
import { Payment } from "@/server/models/Payment";
import { Quote } from "@/server/models/Quote";
import { generateBookingNumber } from "@/server/utils/generate-booking-number";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return new NextResponse("Missing signature", {
        status: 401,
      });
    }

    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!signaturesMatch) {
      return new NextResponse("Invalid signature", {
        status: 401,
      });
    }

    const event = JSON.parse(rawBody);

    /*
     * We only need successful charge events here.
     */
    if (event.event !== "charge.success") {
      return NextResponse.json({
        received: true,
      });
    }

    const transaction = event.data;

    await connectToDatabase();

    const payment = await Payment.findOne({
      reference: transaction.reference,
      provider: "paystack",
    });

    if (!payment) {
      /*
       * Return 200 so Paystack doesn't endlessly retry an event
       * for a transaction that doesn't belong to us.
       *
       * You may prefer 404 depending on your operational policy.
       */
      return NextResponse.json({
        received: true,
      });
    }

    /*
     * Idempotency.
     */
    if (payment.status === "success") {
      return NextResponse.json({
        received: true,
      });
    }

    /*
     * Never mark paid solely because the webhook says success.
     */
    if (transaction.status !== "success") {
      return NextResponse.json({
        received: true,
      });
    }

    if (Number(transaction.amount) !== payment.amountKobo) {
      payment.status = "failed";
      payment.failureReason = "Webhook payment amount mismatch.";

      payment.providerPayload = {
        webhook: transaction,
      };

      await payment.save();

      return NextResponse.json({
        received: true,
      });
    }

    if (transaction.currency !== payment.currency) {
      payment.status = "failed";
      payment.failureReason = "Webhook payment currency mismatch.";

      payment.providerPayload = {
        webhook: transaction,
      };

      await payment.save();

      return NextResponse.json({
        received: true,
      });
    }

    payment.status = "success";
    payment.paidAt = new Date(transaction.paid_at ?? Date.now());

    payment.providerTransactionId = String(transaction.id);

    payment.providerPayload = {
      webhook: transaction,
    };

    await payment.save();

    /*
     * Create booking only once.
     */
    const quote = await Quote.findById(payment.quoteId);

    if (!quote) {
      return NextResponse.json({
        received: true,
      });
    }

    if (!payment.bookingId) {
      /*
       * Replace with your actual Booking schema.
       */
      const booking = await Booking.create({
        bookingNumber: generateBookingNumber(),

        requestId: quote.requestId,

        quoteId: quote._id,

        customerId: payment.customerId,

        paymentReference: payment.reference,

        amountKobo: payment.amountKobo,

        confirmedAt: new Date(),

        status: "confirmed",
      });

      payment.bookingId = booking._id;

      await payment.save();
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return new NextResponse("Webhook error", {
      status: 500,
    });
  }
}
