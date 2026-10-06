import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { StaffProfile } from "@/server/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const availabilitySchema = z.object({
  availability: z.enum(["available", "on_job", "off_duty"]),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireRole(["staff"]);

    if (!user.staffProfileId) {
      return NextResponse.json(
        { message: "Your staff profile is not linked to this account." },
        { status: 400 },
      );
    }

    const parsed = availabilitySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid availability status." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const staff = await StaffProfile.findOneAndUpdate(
      { _id: user.staffProfileId, active: true },
      { $set: { availability: parsed.data.availability } },
      { new: true },
    ).select(
      "_id firstName lastName email phone role availability active rating",
    );

    if (!staff)
      return NextResponse.json(
        { message: "Staff profile not found." },
        { status: 404 },
      );

    return NextResponse.json({
      staff: {
        id: staff._id.toString(),
        firstName: staff.firstName,
        lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`.trim(),
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        availability: staff.availability,
        active: staff.active,
        rating: staff.rating ?? 0,
      },
    });
  } catch (error) {
    console.error("PATCH /api/staff/profile failed:", error);
    const status =
      error instanceof Error && error.message === "Authentication required"
        ? 401
        : error instanceof Error && error.message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json(
      { message: "Unable to update staff profile." },
      { status },
    );
  }
}
