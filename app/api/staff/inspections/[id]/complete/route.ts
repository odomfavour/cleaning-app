import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Inspection } from "@/server/models/Inspection";
import { StaffProfile } from "@/server/models/StaffProfile";
import { CleaningRequest } from "@/server/models/CleaningRequest";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CompleteInspectionBody = {
  condition?: string;
  size?: string;
  duration?: string;
  additionalServices?: string;
  specialRequirements?: string;
  notes?: string;
  photos?: string[];
};

export async function POST(request: Request, context: RouteContext) {
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

    let body: CompleteInspectionBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const condition = body.condition?.trim();
    const size = body.size?.trim();
    const duration = body.duration?.trim();

    if (!condition || !size || !duration) {
      return NextResponse.json(
        {
          message:
            "Property condition, property size, and estimated duration are required.",
        },
        { status: 400 },
      );
    }

    const photos = Array.isArray(body.photos)
      ? body.photos.filter(
          (photo): photo is string =>
            typeof photo === "string" && photo.trim().length > 0,
        )
      : [];

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

    // if (inspection.status !== "in_progress") {
    //   return NextResponse.json(
    //     {
    //       message: "Only inspections in progress can be completed.",
    //     },
    //     { status: 409 },
    //   );
    // }

    inspection.report = {
      condition,
      size,
      duration,
      additionalServices: body.additionalServices?.trim(),
      specialRequirements: body.specialRequirements?.trim(),
      notes: body.notes?.trim(),
      photos,
    };

    inspection.report = {
      condition,
      size,
      duration,
      additionalServices: body.additionalServices?.trim(),
      specialRequirements: body.specialRequirements?.trim(),
      notes: body.notes?.trim(),
      photos,
    };

    inspection.status = "completed";
    inspection.completedAt = new Date();

    await inspection.save();

    const updatedRequest = await CleaningRequest.findByIdAndUpdate(
      inspection.requestId,
      {
        $set: {
          status: "reviewing",
        },
      },
      { new: true },
    );

    if (!updatedRequest) {
      console.error(
        `Inspection ${inspection._id} completed, but request ${inspection.requestId} was not found.`,
      );

      return NextResponse.json(
        {
          message:
            "Inspection was completed, but the associated cleaning request could not be updated.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      inspection: {
        id: inspection._id.toString(),
        requestId: inspection.requestId.toString(),
        scheduledAt: inspection.scheduledAt.toISOString(),
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
        completedAt: inspection.completedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/staff/inspections/[id]/complete failed:", error);

    return NextResponse.json(
      { message: "Unable to complete inspection." },
      { status: 500 },
    );
  }
}
