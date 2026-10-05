import { NextResponse } from "next/server";

import { connectToDatabase } from "@/server/db/connect";
import { createAdminQuote } from "@/server/services/quote.service";
import { getCurrentUser } from "@/lib/auth/session";

import { getAdminQuotes } from "@/server/services/admin-quotes.service";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const quote = await createAdminQuote(body);

    return NextResponse.json(
      {
        quote,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/admin/quotes failed:", error);

    const message =
      error instanceof Error ? error.message : "Unable to create quote.";

    const status = message.includes("not found")
      ? 404
      : message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        message,
      },
      {
        status,
      },
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const quotes = await getAdminQuotes();

    return NextResponse.json({
      quotes,
    });
  } catch (error) {
    console.error("GET /api/admin/quotes failed:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to fetch quotes.",
      },
      { status: 500 },
    );
  }
}
