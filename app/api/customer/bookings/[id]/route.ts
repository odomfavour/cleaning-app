import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { findCustomerBooking } from "@/server/services/customer-bookings.service";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json({ message: "Customer access required." }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    const booking = await findCustomerBooking(user.customerId, id);

    if (!booking) return NextResponse.json({ message: "Booking not found." }, { status: 404 });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("GET /api/customer/bookings/[id] failed:", error);
    return NextResponse.json({ message: "Unable to load this booking." }, { status: 500 });
  }
}