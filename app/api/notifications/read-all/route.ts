import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Notification } from "@/server/models";

export async function POST() {
  try {
    const user = await getCurrentUser();
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (user?.role === "customer" && user.customerId) {
      query.customerId = user.customerId;
    }

    await Notification.updateMany(query, {
      $set: { "metadata.isRead": true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/notifications/read-all error:", error);
    return NextResponse.json(
      { message: "Unable to mark notifications as read." },
      { status: 500 },
    );
  }
}
