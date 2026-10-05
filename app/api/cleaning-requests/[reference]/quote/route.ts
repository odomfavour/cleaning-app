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

export async function GET(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { reference } = await context.params;

    const cleaningRequest = await CleaningRequest.findOne({
      reference,
    }).lean();

    if (!cleaningRequest) {
      return NextResponse.json(
        { message: "Request not found." },
        { status: 404 },
      );
    }

    const cookieHeader = request.headers.get("cookie") ?? "";

    const token = cookieHeader
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${REQUEST_ACCESS_COOKIE_NAME}=`))
      ?.split("=")[1];

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
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!quote) {
      return NextResponse.json({
        quote: null,
      });
    }

    const now = new Date();

    if (quote.status === "sent" && quote.expiresAt && quote.expiresAt <= now) {
      await Quote.updateOne(
        { _id: quote._id, status: "sent" },
        {
          $set: {
            status: "expired",
          },
        },
      );

      quote.status = "expired";
    }

    return NextResponse.json({
      quote: {
        id: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        requestReference: cleaningRequest.reference,

        items: quote.items.map(
          (item: {
            _id: { toString(): string };
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
          }),
        ),

        subtotalKobo: quote.subtotalKobo,
        discountKobo: quote.discountKobo,
        totalKobo: quote.totalKobo,

        status: quote.status,

        sentAt: quote.sentAt?.toISOString(),
        expiresAt: quote.expiresAt?.toISOString(),
        acceptedAt: quote.acceptedAt?.toISOString(),
        declinedAt: quote.declinedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get customer quote error:", error);

    return NextResponse.json(
      { message: "Unable to load quote." },
      { status: 500 },
    );
  }
}
