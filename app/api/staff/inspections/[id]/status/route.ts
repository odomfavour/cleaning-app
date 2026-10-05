import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Inspection } from "@/server/models/Inspection";
import { StaffProfile } from "@/server/models/StaffProfile";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

    let body: {
      status?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    if (body.status !== "in_progress") {
      return NextResponse.json(
        { message: "Invalid inspection status." },
        { status: 400 },
      );
    }

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

    if (inspection.status !== "scheduled") {
      return NextResponse.json(
        {
          message: "Only scheduled inspections can be started.",
        },
        { status: 409 },
      );
    }

    inspection.status = "in_progress";

    await inspection.save();

    return NextResponse.json({
      inspection: {
        id: inspection._id.toString(),
        requestId: inspection.requestId.toString(),
        scheduledAt: inspection.scheduledAt.toISOString(),
        status: inspection.status,
        completedAt: inspection.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/staff/inspections/[id]/status failed:", error);

    return NextResponse.json(
      { message: "Unable to start inspection." },
      { status: 500 },
    );
  }
}
