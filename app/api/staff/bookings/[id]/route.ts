import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Booking } from "@/server/models";
import { getStaffBooking } from "@/server/services/staff-bookings.service";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  status: z.enum(["en_route", "arrived", "in_progress", "completed"]),
});

const nextStatuses: Record<string, string> = {
  confirmed: "en_route",
  assigned: "en_route",
  en_route: "arrived",
  arrived: "in_progress",
  in_progress: "completed",
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireRole(["staff"]);
    if (!user.staffProfileId) {
      return NextResponse.json({ message: "Staff profile is not linked." }, { status: 400 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    const booking = await getStaffBooking(id, user.staffProfileId);

    if (!booking) return NextResponse.json({ message: "Assigned job not found." }, { status: 404 });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("GET /api/staff/bookings/[id] failed:", error);
    const status = error instanceof Error && error.message === "Authentication required"
      ? 401
      : error instanceof Error && error.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json({ message: "Unable to load this job." }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireRole(["staff"]);
    if (!user.staffProfileId) {
      return NextResponse.json({ message: "Staff profile is not linked." }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid job status." }, { status: 400 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    const booking = await Booking.findOne({
      _id: id,
      assignedStaffIds: user.staffProfileId,
    });

    if (!booking) return NextResponse.json({ message: "Assigned job not found." }, { status: 404 });

    if (nextStatuses[booking.status] !== parsed.data.status) {
      return NextResponse.json(
        { message: "This job cannot move to that status yet." },
        { status: 409 },
      );
    }

    booking.status = parsed.data.status;
    if (parsed.data.status === "completed") booking.completedAt = new Date();
    await booking.save();

    const updated = await getStaffBooking(id, user.staffProfileId);
    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("PATCH /api/staff/bookings/[id] failed:", error);
    const status = error instanceof Error && error.message === "Authentication required"
      ? 401
      : error instanceof Error && error.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json({ message: "Unable to update this job." }, { status });
  }
}