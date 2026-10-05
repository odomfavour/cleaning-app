import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Inspection } from "@/server/models/Inspection";
import { StaffProfile } from "@/server/models/StaffProfile";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const reportSchema = z.object({
  condition: z.string().trim().min(1).max(200),
  size: z.string().trim().min(1).max(200),
  duration: z.string().trim().min(1).max(200),
  additionalServices: z.string().trim().max(1000).optional(),
  specialRequirements: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(5000).optional(),
  photos: z.array(z.string().url()).max(8),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (user.role !== "staff" || !user.staffProfileId) {
      return NextResponse.json(
        { message: "Staff access required." },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const staff = await StaffProfile.findOne({
      _id: user.staffProfileId,
      userId: user.id,
      active: true,
    })
      .select("_id")
      .lean();

    if (!staff) {
      return NextResponse.json(
        { message: "Staff profile not found." },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const inspection = await Inspection.findOne({
      _id: id,
      conductedBy: staff._id,
    });

    if (!inspection) {
      return NextResponse.json(
        { message: "Inspection not found." },
        { status: 404 },
      );
    }

    if (inspection.status !== "in_progress") {
      return NextResponse.json(
        {
          message:
            "The inspection report can only be edited while the inspection is in progress.",
        },
        { status: 409 },
      );
    }

    const body = await request.json();

    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid inspection report.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    inspection.report = {
      condition: parsed.data.condition,
      size: parsed.data.size,
      duration: parsed.data.duration,
      additionalServices: parsed.data.additionalServices || undefined,
      specialRequirements: parsed.data.specialRequirements || undefined,
      notes: parsed.data.notes || undefined,
      photos: parsed.data.photos,
    };

    await inspection.save();

    return NextResponse.json({
      inspection: {
        id: inspection._id.toString(),
        status: inspection.status,
        report: {
          condition: inspection.report.condition,
          size: inspection.report.size,
          duration: inspection.report.duration,
          additionalServices: inspection.report.additionalServices,
          specialRequirements: inspection.report.specialRequirements,
          notes: inspection.report.notes,
          photos: inspection.report.photos ?? [],
        },
        completedAt: inspection.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/staff/inspections/[id]/report failed:", error);

    return NextResponse.json(
      { message: "Unable to save inspection report." },
      { status: 500 },
    );
  }
}
