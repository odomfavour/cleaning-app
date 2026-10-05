import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Customer, StaffProfile } from "@/server/models";

export async function GET() {
  try {
    const { response } = await requireAdmin();

    if (response) return response;

    await connectToDatabase();

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    const requestIds = [...new Set(bookings.map((booking: { requestId: { toString(): string } }) => booking.requestId.toString()))];
    const customerIds = [...new Set(bookings.map((booking: { customerId: { toString(): string } }) => booking.customerId.toString()))];
    const staffIds = [...new Set(bookings.flatMap((booking: { assignedStaffIds: { toString(): string }[] }) => booking.assignedStaffIds.map((id) => id.toString())))];

    const [requests, customers, staff] = await Promise.all([
      CleaningRequest.find({ _id: { $in: requestIds } }).lean(),
      Customer.find({ _id: { $in: customerIds } }).select("_id firstName lastName email phone").lean(),
      StaffProfile.find({ _id: { $in: staffIds } }).select("_id firstName lastName").lean(),
    ]);

    const requestMap = new Map(requests.map((request: {
      _id: { toString(): string };
      requestedServices: { name: string }[];
      preferredDate?: Date;
      preferredTimeSlot?: string;
    }) => [request._id.toString(), request]));
    const customerMap = new Map(customers.map((customer: {
      _id: { toString(): string };
      firstName: string;
      lastName: string;
      email?: string;
    }) => [customer._id.toString(), customer]));
    const staffMap = new Map(staff.map((member: {
      _id: { toString(): string };
      firstName: string;
      lastName: string;
    }) => [member._id.toString(), member]));

    return NextResponse.json({
      bookings: bookings.map((booking: {
        _id: { toString(): string };
        bookingNumber: string;
        requestId: { toString(): string };
        customerId: { toString(): string };
        assignedStaffIds: { toString(): string }[];
        scheduledFor?: Date;
        status: string;
        amountKobo: number;
        createdAt: Date;
      }) => {
        const request = requestMap.get(booking.requestId.toString());
        const customer = customerMap.get(booking.customerId.toString());

        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          customer: {
            id: booking.customerId.toString(),
            name: customer
              ? `${customer.firstName} ${customer.lastName}`.trim()
              : "Unknown customer",
            email: customer?.email,
          },
          title: request?.requestedServices?.map((service: { name: string }) => service.name).join(", ") || "Cleaning booking",
          scheduledFor: booking.scheduledFor?.toISOString() ?? null,
          requestedDate: request?.preferredDate?.toISOString() ?? null,
          requestedTime: request?.preferredTimeSlot ?? null,
          staff: booking.assignedStaffIds.map((staffId) => {
            const member = staffMap.get(staffId.toString());
            return {
              id: staffId.toString(),
              name: member ? `${member.firstName} ${member.lastName}`.trim() : "Staff member",
            };
          }),
          status: booking.status,
          amountKobo: booking.amountKobo,
          createdAt: booking.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/admin/bookings failed:", error);

    return NextResponse.json(
      { message: "Unable to load bookings." },
      { status: 500 },
    );
  }
}