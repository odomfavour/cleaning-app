import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Notification } from "@/server/models";

const notificationTitle = (type: string) => {
  switch (type) {
    case "quote_sent":
      return "Your quote is ready";
    case "quote_accepted":
      return "Quote accepted";
    case "quote_declined":
      return "Quote declined";
    case "booking_confirmed":
      return "Booking confirmed";
    case "booking_updated":
      return "Booking updated";
    case "password_reset":
      return "Password reset requested";
    default:
      return "Notification";
  }
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const audience = searchParams.get("audience");

    const query: Record<string, unknown> = {};

    if (user?.role === "customer" && user.customerId) {
      query.customerId = user.customerId;
    } else if (audience === "customer" && user?.customerId) {
      query.customerId = user.customerId;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formatted = notifications.map(
      (n: {
        _id: { toString(): string };
        type: string;
        subject?: string;
        sentAt?: Date;
        createdAt: Date;
        status: string;
        metadata?: { requestReference?: string; isRead?: boolean };
      }) => ({
        id: n._id.toString(),
        title: notificationTitle(n.type),
        body: n.subject ?? "Update on your service request.",
        time: n.sentAt ? n.sentAt.toISOString() : n.createdAt.toISOString(),
        read: Boolean(n.metadata?.isRead),
        href:
          typeof n.metadata?.requestReference === "string"
            ? `/request/${n.metadata.requestReference}`
            : user?.role === "admin"
              ? "/admin"
              : user?.role === "staff"
                ? "/staff"
                : "/dashboard/requests",
      }),
    );

    return NextResponse.json({ notifications: formatted });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { message: "Unable to load notifications." },
      { status: 500 },
    );
  }
}
