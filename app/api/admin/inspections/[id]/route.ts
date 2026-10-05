import { connectToDatabase } from "@/server/db/connect";
import {
  CleaningRequest,
  Customer,
  Inspection,
  StaffProfile,
} from "@/server/models";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const inspection = await Inspection.findById(id).lean();

    if (!inspection) {
      return NextResponse.json(
        { message: "Inspection not found." },
        { status: 404 },
      );
    }

    const request = await CleaningRequest.findById(inspection.requestId)
      .select("_id reference customerId address requestedServices notes")
      .lean();

    if (!request) {
      return NextResponse.json(
        { message: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const [customer, inspector] = await Promise.all([
      Customer.findById(request.customerId)
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
        requestId: request._id.toString(),
        requestReference: request.reference,

        customer: customer
          ? {
              id: customer._id.toString(),
              name: `${customer.firstName} ${customer.lastName}`.trim(),
              email: customer.email,
              phone: customer.phone,
            }
          : {
              id: request.customerId.toString(),
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

      request: {
        id: request._id.toString(),
        reference: request.reference,
        address: request.address,
        requestedServices: request.requestedServices,
        notes: request.notes,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inspections/[id] failed:", error);

    return NextResponse.json(
      { message: "Unable to load inspection." },
      { status: 500 },
    );
  }
}
