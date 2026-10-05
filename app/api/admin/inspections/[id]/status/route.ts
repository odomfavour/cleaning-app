import { connectToDatabase } from "@/server/db/connect";
import { StaffProfile } from "@/server/models";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Customer } from "@/server/models/Customer";
import { Inspection } from "@/server/models/Inspection";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  status: z.enum(["in_progress", "cancelled"]),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid inspection status.",
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

    if (
      parsed.data.status === "in_progress" &&
      inspection.status !== "scheduled"
    ) {
      return NextResponse.json(
        {
          message: "Only scheduled inspections can be started.",
        },
        { status: 409 },
      );
    }

    if (
      parsed.data.status === "cancelled" &&
      ["completed", "cancelled"].includes(inspection.status)
    ) {
      return NextResponse.json(
        {
          message: "This inspection can no longer be cancelled.",
        },
        { status: 409 },
      );
    }

    inspection.status = parsed.data.status;

    await inspection.save();

    const requestDoc = await CleaningRequest.findById(inspection.requestId)
      .select("_id reference customerId")
      .lean();

    if (!requestDoc) {
      return NextResponse.json(
        { message: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const [customer, inspector] = await Promise.all([
      Customer.findById(requestDoc.customerId)
        .select("_id firstName lastName email phone")
        .lean(),

      inspection.conductedBy
        ? StaffProfile.findById(inspection.conductedBy)
            .select("_id firstName lastName role")
            .lean()
        : null,
    ]);

    return NextResponse.json({
      inspection: {
        id: inspection._id.toString(),
        requestId: inspection.requestId.toString(),
        requestReference: requestDoc.reference,

        customer: customer
          ? {
              id: customer._id.toString(),
              name: `${customer.firstName} ${customer.lastName}`.trim(),
              email: customer.email,
              phone: customer.phone,
            }
          : {
              id: requestDoc.customerId.toString(),
              name: "Unknown customer",
            },

        inspector: inspector
          ? {
              id: inspector._id.toString(),
              name: `${inspector.firstName} ${inspector.lastName}`.trim(),
              role: inspector.role,
            }
          : undefined,

        scheduledAt: inspection.scheduledAt.toISOString(),

        status: inspection.status,

        report: inspection.report
          ? {
              condition: inspection.report.condition,
              size: inspection.report.size,
              duration: inspection.report.duration,
              additionalServices: inspection.report.additionalServices,
              specialRequirements: inspection.report.specialRequirements,
              notes: inspection.report.notes,
              photos: inspection.report.photos ?? [],
            }
          : undefined,

        completedAt: inspection.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/inspections/[id]/status failed:", error);

    return NextResponse.json(
      {
        message: "Unable to update inspection status.",
      },
      { status: 500 },
    );
  }
}
