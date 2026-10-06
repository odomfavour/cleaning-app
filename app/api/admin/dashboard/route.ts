import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  Customer,
  Payment,
  Quote,
  Review,
} from "@/server/models";
import { NextResponse } from "next/server";

function startOfWeek(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
  return value;
}

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    await connectToDatabase();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const currentWeek = startOfWeek(now);
    const revenueStart = new Date(currentWeek);
    revenueStart.setDate(revenueStart.getDate() - 7 * 7);

    const [requests, bookings, payments, quotes, reviews] = await Promise.all([
      CleaningRequest.find({}).sort({ createdAt: -1 }).limit(100).lean(),
      Booking.find({}).sort({ scheduledFor: 1, createdAt: -1 }).lean(),
      Payment.find({ status: "success", paidAt: { $gte: revenueStart } })
        .sort({ paidAt: -1 })
        .lean(),
      Quote.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      Review.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const customerIds = [
      ...new Set([
        ...requests.map((request) => request.customerId.toString()),
        ...bookings.map((booking) => booking.customerId.toString()),
        ...payments.map((payment) => payment.customerId.toString()),
        ...quotes.map((quote) => quote.customerId.toString()),
        ...reviews.map((review) => review.customerId.toString()),
      ]),
    ];
    const customers = customerIds.length
      ? await Customer.find({ _id: { $in: customerIds } })
          .select("_id firstName lastName email")
          .lean()
      : [];
    const customerMap = new Map(
      customers.map(
        (customer: {
          _id: { toString(): string };
          firstName: string;
          lastName: string;
        }) => [
          customer._id.toString(),
          `${customer.firstName} ${customer.lastName}`.trim(),
        ],
      ),
    );

    const requestIds = bookings.map((booking) => booking.requestId);
    const bookingRequests = requestIds.length
      ? await CleaningRequest.find({ _id: { $in: requestIds } })
          .select(
            "_id reference requestedServices preferredDate preferredTimeSlot",
          )
          .lean()
      : [];
    const requestMap = new Map(
      bookingRequests.map(
        (request: {
          _id: { toString(): string };
          reference: string;
          requestedServices: { name: string }[];
          preferredDate?: Date;
          preferredTimeSlot?: string;
        }) => [request._id.toString(), request],
      ),
    );

    const upcoming = bookings.filter(
      (booking) =>
        !["completed", "cancelled"].includes(booking.status) &&
        (!booking.scheduledFor || booking.scheduledFor >= todayStart),
    );
    const unassignedUpcoming = upcoming.filter(
      (booking) => booking.assignedStaffIds.length === 0,
    );
    const completed = bookings.filter(
      (booking) => booking.status === "completed",
    );
    const needsQuote = requests.filter((request) =>
      ["reviewing", "inspection_required", "inspection_scheduled"].includes(
        request.status,
      ),
    );
    const weekBuckets = Array.from({ length: 8 }, (_, index) => {
      const start = new Date(revenueStart);
      start.setDate(start.getDate() + index * 7);
      return {
        start,
        label: start.toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        }),
        value: 0,
      };
    });

    for (const payment of payments) {
      if (!payment.paidAt) continue;
      const bucketIndex = Math.floor(
        (startOfWeek(payment.paidAt).getTime() - revenueStart.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );
      if (bucketIndex >= 0 && bucketIndex < weekBuckets.length) {
        weekBuckets[bucketIndex].value += payment.amountKobo / 100;
      }
    }

    const activity = [
      ...payments.slice(0, 3).map((payment) => ({
        id: `payment-${payment._id}`,
        title: `Payment received: NGN ${(payment.amountKobo / 100).toLocaleString("en-NG")}`,
        customer: customerMap.get(payment.customerId.toString()) ?? "Customer",
        at: payment.paidAt?.toISOString() ?? payment.createdAt.toISOString(),
      })),
      ...quotes.slice(0, 3).map((quote) => ({
        id: `quote-${quote._id}`,
        title: `Quote ${quote.quoteNumber} ${quote.status === "sent" ? "sent" : quote.status}`,
        customer: customerMap.get(quote.customerId.toString()) ?? "Customer",
        at: quote.createdAt.toISOString(),
      })),
      ...reviews.slice(0, 2).map((review) => ({
        id: `review-${review._id}`,
        title: `${review.rating}-star review received`,
        customer: customerMap.get(review.customerId.toString()) ?? "Customer",
        at: review.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 6);

    return NextResponse.json({
      stats: {
        requestsToday: requests.filter(
          (request) =>
            request.createdAt >= todayStart &&
            request.createdAt < tomorrowStart,
        ).length,
        needsQuote: needsQuote.length,
        upcomingBookings: upcoming.length,
        unassignedBookings: unassignedUpcoming.length,
        completedBookings: completed.length,
        paidRevenueKobo: payments.reduce(
          (total, payment) => total + payment.amountKobo,
          0,
        ),
      },
      requests: requests.slice(0, 6).map((request) => ({
        id: request._id.toString(),
        reference: request.reference,
        customer:
          customerMap.get(request.customerId.toString()) ??
          request.contactSnapshot?.name ??
          "Unknown customer",
        services: request.requestedServices.map(
          (service: { name: string }) => service.name,
        ),
        status: request.status,
        submittedAt: request.createdAt.toISOString(),
      })),
      bookings: upcoming.slice(0, 5).map((booking) => {
        const request = requestMap.get(booking.requestId.toString());
        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          title:
            request?.requestedServices
              .map((service) => service.name)
              .join(", ") || "Cleaning booking",
          status: booking.status,
          scheduledFor:
            booking.scheduledFor?.toISOString() ??
            request?.preferredDate?.toISOString() ??
            null,
          preferredTime: request?.preferredTimeSlot ?? null,
          customer:
            customerMap.get(booking.customerId.toString()) ??
            "Unknown customer",
          unassigned: booking.assignedStaffIds.length === 0,
        };
      }),
      weeklyRevenue: weekBuckets.map(({ label, value }) => ({ label, value })),
      activity,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard failed:", error);
    return NextResponse.json(
      { message: "Unable to load admin dashboard." },
      { status: 500 },
    );
  }
}
