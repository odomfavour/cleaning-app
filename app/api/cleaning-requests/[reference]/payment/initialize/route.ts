import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Quote } from "@/server/models/Quote";
import { Payment } from "@/server/models/Payment";
import { Customer } from "@/server/models/Customer";
import { canAccessCustomerRequest } from "@/server/auth/customer-request-access";

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

    const cleaningRequest = await CleaningRequest.findOne({
      reference,
    }).lean();

    if (!cleaningRequest) {
      return NextResponse.json(
        {
          message: "Request not found",
        },
        { status: 404 },
      );
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

    const quote = await Quote.findOne({
      requestId: cleaningRequest._id,
    }).lean();

    if (!quote) {
      return NextResponse.json(
        {
          message: "Quote not found",
        },
        { status: 404 },
      );
    }

    if (quote.status !== "accepted") {
      return NextResponse.json(
        {
          message: "Quote must be accepted before payment.",
        },
        { status: 409 },
      );
    }

    if (quote.expiresAt && quote.expiresAt < new Date()) {
      return NextResponse.json(
        {
          message: "This quote has expired.",
        },
        { status: 409 },
      );
    }

    if (quote.totalKobo <= 0) {
      return NextResponse.json(
        {
          message: "This quote does not require payment.",
        },
        { status: 400 },
      );
    }

    /*
     * If a successful payment already exists, don't initialize
     * another one.
     */
    const successfulPayment = await Payment.findOne({
      quoteId: quote._id,
      status: "success",
    }).lean();

    if (successfulPayment) {
      return NextResponse.json(
        {
          message: "This quote has already been paid.",
          payment: {
            id: successfulPayment._id.toString(),
            reference: successfulPayment.reference,
            amountKobo: successfulPayment.amountKobo,
            currency: successfulPayment.currency,
            status: successfulPayment.status,
            paidAt: successfulPayment.paidAt,
          },
        },
        { status: 409 },
      );
    }

    /*
     * Reuse a recent initialized payment if possible.
     *
     * This prevents double-clicks from creating multiple
     * Paystack transactions.
     */
    const existingPayment = await Payment.findOne({
      quoteId: quote._id,
      status: "initialized",
      createdAt: {
        $gte: new Date(Date.now() - 15 * 60 * 1000),
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const existingAccessCode =
      existingPayment?.providerPayload?.initialization?.access_code;

    if (existingPayment && typeof existingAccessCode === "string") {
      return NextResponse.json({
        payment: {
          id: existingPayment._id.toString(),
          reference: existingPayment.reference,
          amountKobo: existingPayment.amountKobo,
          currency: existingPayment.currency,
          status: existingPayment.status,
        },
        accessCode: existingAccessCode,
      });
    }

    const paymentReference = [
      "CLN",
      reference.replace(/[^a-zA-Z0-9]/g, ""),
      Date.now().toString(36),
      crypto.randomBytes(4).toString("hex"),
    ].join("-");

    /*
     * Get the customer's email from your request/customer model.
     *
     * Adjust these fields to your actual schema.
     */
    const customer = await Customer.findById(cleaningRequest.customerId)
      .select("email firstName lastName")
      .lean();

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 },
      );
    }

    const customerEmail =
      cleaningRequest.contactSnapshot?.email?.trim().toLowerCase() ||
      customer.email?.trim().toLowerCase();

    if (!customerEmail) {
      return NextResponse.json(
        { message: "Customer email is required for payment." },
        { status: 400 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { message: "Payment is not configured on the server." },
        { status: 503 },
      );
    }

    const payment = await Payment.create({
      customerId: cleaningRequest.customerId,
      quoteId: quote._id,
      provider: "paystack",
      reference: paymentReference,
      amountKobo: quote.totalKobo,
      currency: "NGN",
      status: "initialized",
    });

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: String(quote.totalKobo),
          currency: "NGN",
          reference: paymentReference,

          metadata: {
            paymentId: payment._id.toString(),
            quoteId: quote._id.toString(),
            requestReference: reference,
          },
        }),
      },
    );

    const paystack = await paystackResponse.json();

    if (!paystackResponse.ok || !paystack.status) {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
        failureReason: paystack?.message ?? "Unable to initialize payment.",
        providerPayload: paystack,
      });

      return NextResponse.json(
        {
          message: paystack?.message ?? "Unable to initialize payment.",
        },
        { status: 502 },
      );
    }

    /*
     * Store the Paystack response for audit/debugging.
     *
     * Do not treat this as proof of payment.
     */
    await Payment.findByIdAndUpdate(payment._id, {
      providerPayload: {
        initialization: paystack.data,
      },
    });

    return NextResponse.json({
      payment: {
        id: payment._id.toString(),
        reference: payment.reference,
        amountKobo: payment.amountKobo,
        currency: payment.currency,
        status: payment.status,
      },

      accessCode: paystack.data.access_code,
    });
  } catch (error) {
    console.error("Initialize customer payment error:", error);

    return NextResponse.json(
      {
        message: "Unable to initialize payment.",
      },
      { status: 500 },
    );
  }
}
