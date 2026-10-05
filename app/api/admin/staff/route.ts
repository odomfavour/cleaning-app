// app/api/admin/staff/route.ts

import { connectToDatabase } from "@/server/db/connect";
import { NextResponse } from "next/server";
import { StaffProfile } from "@/server/models/StaffProfile";
import { User } from "@/server/models/User";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import crypto from "crypto";

const createStaffSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(30),
  role: z.enum(["Cleaner", "Team Lead", "Inspector", "Driver"]),
  availability: z.enum(["available", "on_job", "off_duty"]),
});

export async function GET() {
  try {
    await connectToDatabase();

    const staff = await StaffProfile.find({})
      .select(
        "_id firstName lastName email phone role availability active rating",
      )
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    return NextResponse.json({
      staff: staff.map((member) => ({
        id: member._id.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        name: `${member.firstName} ${member.lastName}`.trim(),
        email: member.email,
        phone: member.phone,
        role: member.role,
        availability: member.availability,
        active: member.active,
        rating: member.rating,
        activeJobs: 0,
        completedJobs: 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/staff failed:", error);

    return NextResponse.json(
      { message: "Unable to load staff." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid staff data.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    // Check both collections.
    const [existingStaff, existingUser] = await Promise.all([
      StaffProfile.findOne({ email }),
      User.findOne({ email }),
    ]);

    if (existingStaff || existingUser) {
      return NextResponse.json(
        { message: "A staff member with this email already exists." },
        { status: 409 },
      );
    }

    /*
     * Generate a temporary password.
     *
     * Example:
     * xK8pQ2mL7z
     */
    const temporaryPassword = crypto.randomBytes(6).toString("base64url");

    const passwordHash = await hashPassword(temporaryPassword);

    /*
     * Create staff profile.
     */
    const staff = await StaffProfile.create({
      ...parsed.data,
      email,
      active: true,
    });

    try {
      /*
       * Create login account.
       */
      const user = await User.create({
        email,
        passwordHash,
        role: "staff",
        active: true,
        staffProfileId: staff._id,
        mustChangePassword: true,
      });

      /*
       * Link the staff profile back to the user.
       */
      await StaffProfile.updateOne(
        { _id: staff._id },
        {
          $set: {
            userId: user._id,
          },
        },
      );
    } catch (userError) {
      /*
       * If creating the User fails, remove the StaffProfile
       * so we don't leave an incomplete staff account behind.
       */
      await StaffProfile.deleteOne({ _id: staff._id });

      throw userError;
    }

    return NextResponse.json(
      {
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

        /*
         * Return this once so the admin can give it
         * to the new staff member.
         */
        temporaryPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/staff failed:", error);

    return NextResponse.json(
      { message: "Unable to create staff member." },
      { status: 500 },
    );
  }
}
