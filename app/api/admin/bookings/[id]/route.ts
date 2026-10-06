import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  Customer,
  Payment,
  StaffProfile,
} from "@/server/models";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z
  .object({
    staffIds: z.array(z.string().refine(Types.ObjectId.isValid)).optional(),
    status: z
      .enum([
        "confirmed",
        "assigned",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
      ])
      .optional(),
  })
  .refine(
    (value) => value.staffIds !== undefined || value.status !== undefined,
  );

async function loadBooking(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;

  const booking = await Booking.findById(id).lean();
  if (!booking) return null;

  const [request, customer, payment, staff] = await Promise.all([
    CleaningRequest.findById(booking.requestId).lean(),
    Customer.findById(booking.customerId)
      .select("firstName lastName email phone")
      .lean(),
    Payment.findOne({ reference: booking.paymentReference }).lean(),
    StaffProfile.find({ _id: { $in: booking.assignedStaffIds } })
      .select("_id firstName lastName role phone availability")
      .lean(),
  ]);

  return {
    booking: {
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      amountKobo: booking.amountKobo,
      paymentReference: booking.paymentReference,
      scheduledFor: booking.scheduledFor?.toISOString() ?? null,
      confirmedAt: booking.confirmedAt.toISOString(),
      assignedStaffIds: booking.assignedStaffIds.map(
        (staffId: Types.ObjectId) => staffId.toString(),
      ),
    },
    request: request
      ? {
          id: request._id.toString(),
          reference: request.reference,
          services: request.requestedServices.map(
            (service: { name: string }) => service.name,
          ),
          location: [
            request.address.addressLine1,
            request.address.area,
            request.address.city,
            request.address.state,
          ]
            .filter(Boolean)
            .join(", "),
          preferredDate: request.preferredDate?.toISOString() ?? null,
          preferredTime: request.preferredTimeSlot ?? null,
          instructions: request.notes ?? "",
        }
      : null,
    customer: customer
      ? {
          id: booking.customerId.toString(),
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email ?? "",
          phone: customer.phone ?? "",
        }
      : null,
    payment: payment
      ? {
          reference: payment.reference,
          status: payment.status,
          paidAt: payment.paidAt?.toISOString() ?? null,
        }
      : null,
    staff: staff.map((member) => ({
      id: member._id.toString(),
      name: `${member.firstName} ${member.lastName}`.trim(),
      role: member.role,
      phone: member.phone,
      availability: member.availability,
    })),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    await connectToDatabase();
    const { id } = await context.params;
    const data = await loadBooking(id);

    if (!data) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("GET /api/admin/bookings/[id] failed:", error);
    return NextResponse.json(
      { message: "Unable to load booking." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    await connectToDatabase();
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid booking update." },
        { status: 400 },
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    const update: Record<string, unknown> = {};

    if (parsed.data.staffIds) {
      const staffIds = [...new Set(parsed.data.staffIds)];
      const staff = await StaffProfile.find({
        _id: { $in: staffIds },
        active: true,
        role: { $ne: "Inspector" },
      })
        .select("_id")
        .lean();

      if (staff.length !== staffIds.length) {
        return NextResponse.json(
          {
            message:
              "One or more selected staff are unavailable for assignment.",
          },
          { status: 400 },
        );
      }

      update.assignedStaffIds = staff.map((member) => member._id);
      if (staffIds.length && booking.status === "confirmed")
        update.status = "assigned";
      if (!staffIds.length && booking.status === "assigned")
        update.status = "confirmed";
    }

    if (parsed.data.status) {
      update.status = parsed.data.status;
      if (parsed.data.status === "completed") update.completedAt = new Date();
    }

    await Booking.updateOne({ _id: booking._id }, { $set: update });
    const updated = await loadBooking(id);

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("PATCH /api/admin/bookings/[id] failed:", error);
    return NextResponse.json(
      { message: "Unable to update booking." },
      { status: 500 },
    );
  }
}
