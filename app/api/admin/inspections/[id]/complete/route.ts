import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Inspection } from "@/server/models/Inspection";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  condition: z.string().trim().min(1).max(200),
  size: z.string().trim().min(1).max(200),
  duration: z.string().trim().min(1).max(200),
  additionalServices: z.string().trim().max(2000).optional(),
  specialRequirements: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(5000).optional(),
  photos: z.array(z.string()).max(8).default([]),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid inspection report.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const inspection = await Inspection.findById(id);

    if (!inspection) {
      return NextResponse.json(
        { message: "Inspection not found." },
        { status: 404 },
      );
    }

    if (inspection.status !== "in_progress") {
      return NextResponse.json(
        {
          message: "Only an inspection in progress can be completed.",
        },
        { status: 409 },
      );
    }

    inspection.report = parsed.data;
    inspection.status = "completed";
    inspection.completedAt = new Date();

    inspection.notes = parsed.data.notes;
    inspection.findings = [
      parsed.data.condition,
      parsed.data.size,
      parsed.data.duration,
      parsed.data.additionalServices,
      parsed.data.specialRequirements,
      parsed.data.notes,
    ]
      .filter(Boolean)
      .join("\n");

    await inspection.save();

    await CleaningRequest.findByIdAndUpdate(inspection.requestId, {
      $set: {
        status: "reviewing",
      },
    });

    return NextResponse.json({
      inspection: {
        id: inspection._id.toString(),
        requestId: inspection.requestId.toString(),
        scheduledAt: inspection.scheduledAt.toISOString(),
        status: inspection.status,

        report: {
          condition: inspection.report?.condition,
          size: inspection.report?.size,
          duration: inspection.report?.duration,
          additionalServices: inspection.report?.additionalServices,
          specialRequirements: inspection.report?.specialRequirements,
          notes: inspection.report?.notes,
          photos: inspection.report?.photos ?? [],
        },

        completedAt: inspection.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/admin/inspections/[id]/complete failed:", error);

    return NextResponse.json(
      { message: "Unable to complete inspection." },
      { status: 500 },
    );
  }
}
