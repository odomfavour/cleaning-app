import { NextResponse } from "next/server";

import { CleaningRequest, Quote } from "@/server/models";
import {
  REQUEST_ACCESS_COOKIE_NAME,
  verifyRequestAccessToken,
} from "@/server/auth/request-access";
import { connectToDatabase } from "@/server/db/connect";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

function getAccessToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  return cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${REQUEST_ACCESS_COOKIE_NAME}=`))
    ?.split("=")[1];
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { reference } = await context.params;

    const cleaningRequest = await CleaningRequest.findOne({
      reference,
    });

    if (!cleaningRequest) {
      return NextResponse.json(
        { message: "Request not found." },
        { status: 404 },
      );
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Request verification required." },
        { status: 401 },
      );
    }

    const payload = verifyRequestAccessToken(decodeURIComponent(token));

    if (!payload) {
      return NextResponse.json(
        { message: "Request verification required." },
        { status: 401 },
      );
    }

    if (
      payload.requestId !== cleaningRequest._id.toString() ||
      payload.customerId !== cleaningRequest.customerId.toString()
    ) {
      return NextResponse.json(
        { message: "You do not have access to this request." },
        { status: 403 },
      );
    }

    const quote = await Quote.findOne({
      requestId: cleaningRequest._id,
    }).sort({ createdAt: -1 });

    if (!quote) {
      return NextResponse.json(
        { message: "No quote is available for this request." },
        { status: 404 },
      );
    }

    if (quote.status === "accepted") {
      return NextResponse.json({
        quote: serializeQuote(quote, reference),
      });
    }

    if (quote.status !== "sent") {
      return NextResponse.json(
        {
          message: `This quote cannot be accepted because its status is ${quote.status}.`,
        },
        { status: 409 },
      );
    }

    if (quote.expiresAt && quote.expiresAt <= new Date()) {
      quote.status = "expired";
      await quote.save();

      return NextResponse.json(
        { message: "This quote has expired." },
        { status: 409 },
      );
    }

    quote.status = "accepted";
    quote.acceptedAt = new Date();

    await quote.save();

    cleaningRequest.status = "accepted";

    await cleaningRequest.save();

    return NextResponse.json({
      quote: serializeQuote(quote, reference),
    });
  } catch (error) {
    console.error("Accept customer quote error:", error);

    return NextResponse.json(
      { message: "Unable to accept quote." },
      { status: 500 },
    );
  }
}

function serializeQuote(quote: any, requestReference: string) {
  return {
    id: quote._id.toString(),
    quoteNumber: quote.quoteNumber,
    requestReference,

    items: quote.items.map((item: any) => ({
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
    declinedAt: quote.declinedAt?.toISOString(),
  };
}
