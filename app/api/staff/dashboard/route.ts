import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  Customer,
  StaffProfile,
} from "@/server/models";

export async function GET() {
  try {
    const user = await requireRole(["staff"]);

    if (!user.staffProfileId) {
      return NextResponse.json(
        { message: "Your staff profile is not linked to your account." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const staff = await StaffProfile.findById(user.staffProfileId)
      .select(
        "_id firstName lastName email phone role availability active rating",
      )
      .lean();

    if (!staff) {
      return NextResponse.json(
        { message: "Staff profile not found." },
        { status: 404 },
      );
    }

    /*
     * Get bookings assigned to the currently logged-in staff member.
     *
     * We fetch all of their assigned bookings here and calculate the
     * dashboard sections below.
     */
    const bookings = await Booking.find({
      assignedStaffIds: staff._id,
    })
      .sort({ scheduledFor: 1 })
      .lean();

    /*
     * Get only the customers belonging to these bookings.
     */
    const customerIds = [
      ...new Set(bookings.map((booking) => booking.customerId.toString())),
    ];
    const requestIds = [
      ...new Set(bookings.map((booking) => booking.requestId.toString())),
    ];

    const [customers, requests] = await Promise.all([
      customerIds.length
        ? Customer.find({ _id: { $in: customerIds } })
            .select("_id firstName lastName email phone")
            .lean()
        : [],
      requestIds.length
        ? CleaningRequest.find({ _id: { $in: requestIds } })
            .select(
              "_id requestedServices address preferredDate preferredTimeSlot",
            )
            .lean()
        : [],
    ]);

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
    const requestMap = new Map(
      requests.map(
        (request: {
          _id: { toString(): string };
          requestedServices: { name: string }[];
          address: { addressLine1: string; area?: string; city: string };
          preferredDate?: Date;
          preferredTimeSlot?: string;
        }) => [request._id.toString(), request],
      ),
    );

    const now = new Date();

    const mappedBookings = bookings.map((booking) => {
      const customer = customerMap.get(booking.customerId.toString());
      const request = requestMap.get(booking.requestId.toString());

      return {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId.toString(),

        customer: customer ?? null,

        scheduledFor: booking.scheduledFor?.toISOString() ?? null,
        date:
          booking.scheduledFor?.toISOString() ??
          request?.preferredDate?.toISOString() ??
          null,
        time: request?.preferredTimeSlot ?? null,
        title:
          request?.requestedServices
            .map((service) => service.name)
            .join(", ") ?? "Cleaning booking",
        location: request
          ? [
              request.address.addressLine1,
              request.address.area,
              request.address.city,
            ]
              .filter(Boolean)
              .join(", ")
          : "",

        status: booking.status,

        amountKobo: booking.amountKobo,

        confirmedAt: booking.confirmedAt?.toISOString() ?? null,
        completedAt: booking.completedAt?.toISOString() ?? null,
      };
    });

    const openBookings = mappedBookings.filter(
      (booking) => !["completed", "cancelled"].includes(booking.status),
    );

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const today = openBookings.filter((booking) => {
      if (!booking.scheduledFor) return false;

      const scheduled = new Date(booking.scheduledFor);

      return scheduled >= todayStart && scheduled < tomorrowStart;
    });

    const upcoming = openBookings.filter((booking) => {
      if (!booking.scheduledFor) return false;

      return new Date(booking.scheduledFor) >= tomorrowStart;
    });

    const completed = mappedBookings.filter(
      (booking) => booking.status === "completed",
    );

    return NextResponse.json({
      staff: {
        id: staff._id.toString(),
        firstName: staff.firstName,
        lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`.trim(),
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        availability: staff.availability,
        active: staff.active,
        rating: staff.rating,
      },

      stats: {
        today: today.length,
        upcoming: upcoming.length,
        completed: completed.length,
      },

      jobs: {
        all: mappedBookings,
        today,
        upcoming,
        completed: completed.slice(-2).reverse(),
      },
    });
  } catch (error) {
    console.error("GET /api/staff/dashboard failed:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Unable to load staff dashboard." },
      { status: 500 },
    );
  }
}
