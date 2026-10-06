import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Booking } from "@/server/models";
import { serializeCustomerBooking } from "@/server/services/customer-bookings.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json(
        { message: "Customer access required." },
        { status: 403 },
      );
    }

    await connectToDatabase();
    const bookings = await Booking.find({ customerId: user.customerId })
      .sort({ scheduledFor: 1, createdAt: -1 })
      .lean();
    const serialized = await Promise.all(
      bookings.map((booking) => serializeCustomerBooking(booking)),
    );

    return NextResponse.json({ bookings: serialized });
  } catch (error) {
    console.error("GET /api/customer/bookings failed:", error);
    return NextResponse.json(
      { message: "Unable to load your bookings." },
      { status: 500 },
    );
  }
}
