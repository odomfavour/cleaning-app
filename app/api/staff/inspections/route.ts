import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Customer } from "@/server/models/Customer";
import { Inspection } from "@/server/models/Inspection";
import { StaffProfile } from "@/server/models/StaffProfile";

export async function GET() {
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

    const inspections = await Inspection.find({
      conductedBy: staff._id,
    })
      .sort({ scheduledAt: 1 })
      .lean();

    const requestIds = inspections.map((inspection) => inspection.requestId);

    const requests = await CleaningRequest.find({
      _id: { $in: requestIds },
    })
      .select(
        "_id reference customerId address propertyDetails requestedServices notes",
      )
      .lean();

    const customerIds = [
      ...new Set(requests.map((request) => request.customerId.toString())),
    ];

    const customers = await Customer.find({
      _id: { $in: customerIds },
    })
      .select("_id firstName lastName email phone")
      .lean();

    const requestMap = new Map(
      requests.map((request) => [request._id.toString(), request]),
    );

    const customerMap = new Map(
      customers.map((customer) => [
        customer._id.toString(),
        {
          id: customer._id.toString(),
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          phone: customer.phone,
        },
      ]),
    );

    const response = inspections.map((inspection) => {
      const request = requestMap.get(inspection.requestId.toString());

      const customer = request
        ? customerMap.get(request.customerId.toString())
        : undefined;

      return {
        id: inspection._id.toString(),
        requestId: inspection.requestId.toString(),
        requestReference: request?.reference ?? "Unknown request",

        customer: customer ?? {
          id: request?.customerId.toString() ?? "",
          name: "Unknown customer",
        },

        scheduledAt: inspection.scheduledAt.toISOString(),
        status: inspection.status,

        address: request?.address ?? {
          addressLine1: "",
          city: "",
          state: "",
          country: "",
        },

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
      };
    });

    return NextResponse.json({
      inspections: response,
    });
  } catch (error) {
    console.error("GET /api/staff/inspections failed:", error);

    return NextResponse.json(
      { message: "Unable to load inspections." },
      { status: 500 },
    );
  }
}
