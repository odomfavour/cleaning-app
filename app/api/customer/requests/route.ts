import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Quote } from "@/server/models";
import { NextResponse } from "next/server";

const requestStatus = (status: string) => {
  switch (status) {
    case "submitted":
      return "new";
    case "reviewing":
      return "under_review";
    case "inspection_scheduled":
      return "inspection_required";
    case "quoted":
      return "quote_sent";
    case "converted":
      return "accepted";
    default:
      return status;
  }
};

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Login required." }, { status: 401 });
    }

    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json({ message: "Customer access required." }, { status: 403 });
    }

    const requests = await CleaningRequest.find({ customerId: user.customerId })
      .sort({ createdAt: -1 })
      .lean();
    const requestIds = requests.map((request) => request._id);
    const [quotes, bookings] = await Promise.all([
      Quote.find({ requestId: { $in: requestIds } }).sort({ createdAt: -1 }).lean(),
      Booking.find({ requestId: { $in: requestIds } }).lean(),
    ]);
    const latestQuotes = new Map<string, (typeof quotes)[number]>();

    for (const quote of quotes) {
      const key = quote.requestId.toString();
      if (!latestQuotes.has(key)) latestQuotes.set(key, quote);
    }

    const bookingByRequest = new Map(
      bookings.map((booking) => [booking.requestId.toString(), booking]),
    );

    return NextResponse.json({
      requests: requests.map((request) => {
        const quote = latestQuotes.get(request._id.toString());
        const booking = bookingByRequest.get(request._id.toString());
        const environment = request.propertyDetails?.environment ?? request.propertyType ?? "other";

        return {
          id: request.reference,
          reference: request.reference,
          status: requestStatus(request.status),
          services: request.requestedServices.map(
            (service: { name: string }) => service.name,
          ),
          environment,
          submittedAt: request.createdAt.toISOString(),
          quote: quote
            ? {
                id: quote._id.toString(),
                totalKobo: quote.totalKobo,
                status: quote.status,
              }
            : null,
          bookingId: booking?._id.toString(),
        };
      }),
    });
  } catch (error) {
    console.error("GET customer requests failed:", error);
    return NextResponse.json(
      { message: "Unable to load your requests." },
      { status: 500 },
    );
  }
}