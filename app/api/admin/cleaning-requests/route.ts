import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Customer } from "@/server/models/Customer";

export async function GET() {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    await connectToDatabase();

    const requests = await CleaningRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    const customerIds = [
      ...new Set(requests.map((request) => request.customerId.toString())),
    ];

    const customers = await Customer.find({
      _id: { $in: customerIds },
    })
      .select("_id firstName lastName email phone")
      .lean();

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

    const responseData = requests.map((request) => {
      const customer = customerMap.get(request.customerId.toString());

      return {
        id: request._id.toString(),
        reference: request.reference,
        customerId: request.customerId.toString(),

        customer: customer ?? {
          id: request.customerId.toString(),
          name: request.contactSnapshot?.name ?? "Unknown customer",
          email: request.contactSnapshot?.email,
          phone: request.contactSnapshot?.phone,
        },

        services: request.requestedServices.map(
          (service: { name: string }) => service.name,
        ),

        environment: request.propertyDetails?.environment,
        propertyType: request.propertyType,

        submittedAt: request.createdAt.toISOString(),
        status: request.status,
      };
    });

    return NextResponse.json({
      requests: responseData,
    });
  } catch (error) {
    console.error("GET /api/admin/cleaning-requests failed:", error);

    return NextResponse.json(
      { message: "Unable to load cleaning requests." },
      { status: 500 },
    );
  }
}
