import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { getAdminQuoteById } from "@/server/services/admin-quotes.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    const { id } = await context.params;

    const quote = await getAdminQuoteById(id);

    return NextResponse.json({
      quote,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid quote ID.") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Quote not found.") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("GET /api/admin/quotes/[id] failed:", error);

    return NextResponse.json(
      { message: "Unable to fetch quote." },
      { status: 500 },
    );
  }
}
