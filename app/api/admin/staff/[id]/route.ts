// app/api/admin/staff/[id]/route.ts

import { connectToDatabase } from "@/server/db/connect";
import { NextResponse } from "next/server";
import { z } from "zod";
import { StaffProfile } from "@/server/models/StaffProfile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateStaffSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  role: z.enum(["Cleaner", "Team Lead", "Inspector", "Driver"]).optional(),
  availability: z.enum(["available", "on_job", "off_duty"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const body = await request.json();

    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid staff data.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const staff = await StaffProfile.findById(id);

    if (!staff) {
      return NextResponse.json(
        { message: "Staff member not found." },
        { status: 404 },
      );
    }

    if (parsed.data.email) {
      const duplicate = await StaffProfile.findOne({
        email: parsed.data.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            message: "Another staff member already uses this email.",
          },
          { status: 409 },
        );
      }
    }

    Object.assign(staff, parsed.data);

    await staff.save();

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
        rating: staff.rating,
        activeJobs: 0,
        completedJobs: 0,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/staff/[id] failed:", error);

    return NextResponse.json(
      { message: "Unable to update staff member." },
      { status: 500 },
    );
  }
}
