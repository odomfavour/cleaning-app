// app/api/admin/inspections/route.ts

import { connectToDatabase } from "@/server/db/connect";
import { Customer } from "@/server/models";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Inspection } from "@/server/models/Inspection";
import { StaffProfile } from "@/server/models/StaffProfile";
import { NextResponse } from "next/server";
import { z } from "zod";

const scheduleInspectionSchema = z.object({
  requestId: z.string().min(1),
  inspectorId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const parsed = scheduleInspectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid inspection scheduling data.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { requestId, inspectorId, date, time } = parsed.data;

    const cleaningRequest = await CleaningRequest.findById(requestId);

    if (!cleaningRequest) {
      return NextResponse.json(
        { message: "Cleaning request not found." },
        { status: 404 },
      );
    }

    if (
      !["reviewing", "inspection_required"].includes(cleaningRequest.status)
    ) {
      return NextResponse.json(
        {
          message: "This request is not currently eligible for an inspection.",
        },
        { status: 409 },
      );
    }

    const inspector = await StaffProfile.findOne({
      _id: inspectorId,
      active: true,
      availability: "available",
      role: { $in: ["Inspector", "Team Lead"] },
    })
      .select("_id")
      .lean();

    if (!inspector) {
      return NextResponse.json(
        {
          message: "Selected staff member is not an active inspector.",
        },
        { status: 400 },
      );
    }

    /*
     * The UI sends a local date and time, e.g.
     *
     * date = "2026-10-05"
     * time = "08:00"
     *
     * Cleanin currently operates in Nigeria, so construct the
     * scheduled time as Africa/Lagos rather than accidentally
     * treating it as UTC.
     */
    const scheduledAt = new Date(`${date}T${time}:00+01:00`);

    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { message: "Invalid inspection date or time." },
        { status: 400 },
      );
    }

    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        {
          message: "Inspection must be scheduled for a future date and time.",
        },
        { status: 400 },
      );
    }

    const existingInspection = await Inspection.findOne({
      requestId,
      status: "scheduled",
    });

    if (existingInspection) {
      return NextResponse.json(
        {
          message: "This request already has a scheduled inspection.",
        },
        { status: 409 },
      );
    }

    const inspection = await Inspection.create({
      requestId,
      scheduledAt,
      conductedBy: inspectorId,
      status: "scheduled",
    });

    cleaningRequest.inspectionRequired = true;
    cleaningRequest.inspectionId = inspection._id;
    cleaningRequest.status = "inspection_scheduled";

    await cleaningRequest.save();

    return NextResponse.json(
      {
        inspection: {
          id: inspection._id.toString(),
          requestId: inspection.requestId.toString(),
          scheduledAt: inspection.scheduledAt.toISOString(),
          conductedBy: inspection.conductedBy?.toString(),
          status: inspection.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/inspections failed:", error);

    return NextResponse.json(
      { message: "Unable to schedule inspection." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const inspections = await Inspection.find({})
      .sort({ scheduledAt: -1 })
      .lean();

    const requestIds = inspections.map((inspection) => inspection.requestId);

    const staffIds = inspections
      .map((inspection) => inspection.conductedBy)
      .filter(Boolean);

    const requests = await CleaningRequest.find({
      _id: { $in: requestIds },
    })
      .select("_id reference customerId")
      .lean();

    const customerIds = requests.map((request) => request.customerId);

    const [customers, staff] = await Promise.all([
      Customer.find({
        _id: { $in: customerIds },
      })
        .select("_id firstName lastName email phone")
        .lean(),

      StaffProfile.find({
        _id: { $in: staffIds },
      })
        .select("_id firstName lastName role")
        .lean(),
    ]);

    const requestMap = new Map(
      requests.map((request) => [request._id.toString(), request]),
    );

    const customerMap = new Map(
      customers.map((customer) => [customer._id.toString(), customer]),
    );

    const staffMap = new Map(
      staff.map((member) => [member._id.toString(), member]),
    );

    return NextResponse.json({
      inspections: inspections.map((inspection) => {
        const request = requestMap.get(inspection.requestId.toString());

        const customer = request
          ? customerMap.get(request.customerId.toString())
          : undefined;

        const inspector = inspection.conductedBy
          ? staffMap.get(inspection.conductedBy.toString())
          : undefined;

        return {
          id: inspection._id.toString(),
          requestId: inspection.requestId.toString(),
          requestReference: request?.reference ?? "—",

          customer: customer
            ? {
                id: customer._id.toString(),
                name: `${customer.firstName} ${customer.lastName}`.trim(),
                email: customer.email,
                phone: customer.phone,
              }
            : {
                id: request?.customerId.toString() ?? "",
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
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/admin/inspections failed:", error);

    return NextResponse.json(
      { message: "Unable to load inspections." },
      { status: 500 },
    );
  }
}
