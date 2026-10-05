import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  Customer,
  Notification,
  Quote,
  Review,
  StaffProfile,
} from "@/server/models";
import { NextResponse } from "next/server";

const publicRequestStatus = (status: string) => {
  switch (status) {
    case "submitted": return "new";
    case "reviewing": return "under_review";
    case "inspection_scheduled": return "inspection_required";
    case "quoted": return "quote_sent";
    case "converted": return "accepted";
    default: return status;
  }
};

const notificationTitle = (type: string) => {
  switch (type) {
    case "quote_sent": return "Your quote is ready";
    case "quote_accepted": return "Quote accepted";
    case "quote_declined": return "Quote declined";
    case "booking_confirmed": return "Booking confirmed";
    case "booking_updated": return "Booking updated";
    default: return "Request update";
  }
};

export async function GET() {
  try {
    const user = await requireRole(["customer"]);

    if (!user.customerId) {
      return NextResponse.json(
        { message: "Customer profile is not linked to this account." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const customer = await Customer.findById(user.customerId)
      .select("firstName lastName email phone")
      .lean();

    if (!customer) {
      return NextResponse.json({ message: "Customer profile not found." }, { status: 404 });
    }

    const [requests, quotes, bookings, notifications] = await Promise.all([
      CleaningRequest.find({ customerId: customer._id }).sort({ createdAt: -1 }).lean(),
      Quote.find({ customerId: customer._id }).sort({ createdAt: -1 }).lean(),
      Booking.find({ customerId: customer._id }).sort({ scheduledFor: 1 }).lean(),
      Notification.find({ customerId: customer._id, channel: "email", status: "sent" })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const bookingIds = bookings.map((booking) => booking._id);
    const [reviews, staff] = await Promise.all([
      Review.find({ bookingId: { $in: bookingIds } }).select("bookingId").lean(),
      StaffProfile.find({ _id: { $in: bookings.flatMap((booking) => booking.assignedStaffIds) } })
        .select("_id firstName lastName")
        .lean(),
    ]);

    const latestQuoteByRequest = new Map<string, (typeof quotes)[number]>();
    for (const quote of quotes) {
      const requestId = quote.requestId.toString();
      if (!latestQuoteByRequest.has(requestId)) latestQuoteByRequest.set(requestId, quote);
    }

    const requestMap = new Map(
      requests.map((request: {
        _id: { toString(): string };
        reference: string;
        requestedServices: { name: string }[];
        address: { addressLine1: string; area?: string; city: string };
        preferredDate?: Date;
        preferredTimeSlot?: string;
      }) => [request._id.toString(), request]),
    );
    const staffMap = new Map(
      staff.map((member: {
        _id: { toString(): string };
        firstName: string;
        lastName: string;
      }) => [member._id.toString(), member]),
    );
    const reviewedBookingIds = new Set(reviews.map((review) => review.bookingId.toString()));

    return NextResponse.json({
      customer: {
        id: customer._id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email ?? "",
        phone: customer.phone ?? "",
      },
      requests: requests.map((request: {
        _id: { toString(): string };
        reference: string;
        status: string;
        requestedServices: { name: string }[];
        createdAt: Date;
      }) => {
        const quote = latestQuoteByRequest.get(request._id.toString());
        return {
          id: request.reference,
          reference: request.reference,
          status: publicRequestStatus(request.status),
          services: request.requestedServices.map((service: { name: string }) => service.name),
          submittedAt: request.createdAt.toISOString(),
          quote: quote ? {
            id: quote._id.toString(),
            quoteNumber: quote.quoteNumber,
            totalKobo: quote.totalKobo,
            status: quote.status,
            expiresAt: quote.expiresAt?.toISOString() ?? null,
          } : null,
        };
      }),
      bookings: bookings.map((booking: {
        _id: { toString(): string };
        bookingNumber: string;
        requestId: { toString(): string };
        scheduledFor?: Date;
        status: string;
        amountKobo: number;
        assignedStaffIds: { toString(): string }[];
      }) => {
        const request = requestMap.get(booking.requestId.toString());
        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          title: request?.requestedServices.map((service) => service.name).join(", ") ?? "Cleaning",
          date: booking.scheduledFor?.toISOString() ?? request?.preferredDate?.toISOString() ?? null,
          time: request?.preferredTimeSlot ?? null,
          location: request
            ? [request.address.addressLine1, request.address.area, request.address.city].filter(Boolean).join(", ")
            : "",
          status: booking.status,
          amountKobo: booking.amountKobo,
          staff: booking.assignedStaffIds.map((staffId: { toString(): string }) => {
            const member = staffMap.get(staffId.toString());
            return member ? {
              id: member._id.toString(),
              name: `${member.firstName} ${member.lastName}`.trim(),
            } : null;
          }).filter(Boolean),
          reviewNeeded: booking.status === "completed" && !reviewedBookingIds.has(booking._id.toString()),
        };
      }),
      activity: notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notificationTitle(notification.type),
        body: notification.subject ?? "There is an update to your cleaning request.",
        time: notification.sentAt?.toISOString() ?? notification.createdAt.toISOString(),
        href: typeof notification.metadata?.requestReference === "string"
          ? `/request/${notification.metadata.requestReference}`
          : "/dashboard/requests",
      })),
    });
  } catch (error) {
    console.error("GET /api/customer/dashboard failed:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Customer access required." }, { status: 403 });
    }

    return NextResponse.json({ message: "Unable to load customer dashboard." }, { status: 500 });
  }
}