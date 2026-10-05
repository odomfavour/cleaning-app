import { Customer, CleaningRequest, CleaningService } from "@/server/models";
import { connectToDatabase } from "@/server/db/connect";
import { createCleaningRequestSchema } from "@/lib/validations/cleaning-request";

export const runtime = "nodejs";

function generateRequestReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `REQ-${timestamp}-${random}`;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);

  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ") || firstName;

  return {
    firstName,
    lastName,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = createCleaningRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid cleaning request.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    await connectToDatabase();

    /*
     * 1. Find or create the customer.
     *
     * This is the guest flow for now.
     * We will replace/extend this with your authenticated
     * customer session once the backend auth is wired up.
     */
    const email = data.contact.email.toLowerCase().trim();

    let customer = await Customer.findOne({
      email,
    });

    if (!customer) {
      const { firstName, lastName } = splitName(data.contact.name);

      customer = await Customer.create({
        firstName,
        lastName,
        email,
        phone: data.contact.phone,
        hasAccount: false,
        status: "active",
      });
    } else if (customer.status === "blocked") {
      return Response.json(
        {
          error: "This customer account cannot submit requests.",
        },
        { status: 403 },
      );
    }

    /*
     * 2. Validate requested services.
     *
     * The frontend sends IDs only.
     * We load the actual services and snapshot their names.
     */
    const serviceIds = data.requestedServices.map(
      (service) => service.serviceId,
    );

    const services = await CleaningService.find({
      _id: { $in: serviceIds },
      active: true,
    })
      .select("_id name")
      .lean();

    if (services.length !== serviceIds.length) {
      return Response.json(
        {
          error: "One or more selected cleaning services are unavailable.",
        },
        { status: 400 },
      );
    }

    const serviceMap = new Map(
      services.map((service) => [service._id.toString(), service.name]),
    );

    const requestedServices = serviceIds.map((serviceId) => ({
      serviceId,
      name: serviceMap.get(serviceId)!,
    }));

    /*
     * 3. Build the notes.
     *
     * Your original schema has one notes field, while the form
     * has several descriptive fields.
     *
     * We keep the original schema and combine the descriptive
     * fields into notes.
     */
    const noteParts = [
      data.notes ? `Description:\n${data.notes}` : null,
      data.propertyDetails.additional
        ? `Additional areas:\n${data.propertyDetails.additional}`
        : null,
    ].filter(Boolean);

    const notes = noteParts.join("\n\n") || undefined;

    /*
     * 4. Create the request.
     */
    const cleaningRequest = await CleaningRequest.create({
      reference: generateRequestReference(),

      customerId: customer._id,

      contactSnapshot: {
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
      },

      requestedServices,

      address: {
        addressLine1: data.address.addressLine1,
        addressLine2: data.address.addressLine2,
        area: data.address.area,
        city: data.address.city,
        state: data.address.state,
        country: data.address.country,
        postalCode: data.address.postalCode,
        landmark: data.address.landmark,
        directions: data.address.directions,
      },

      propertyType: data.propertyType,

      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,

      propertyDetails: data.propertyDetails,

      preferredDate: data.preferredDate,
      preferredTimeSlot: data.preferredTimeSlot,

      schedule: {
        alternativeDate: data.schedule.alternativeDate,
        alternativeTimeSlot: data.schedule.alternativeTimeSlot,
        flexible: data.schedule.flexible,
      },

      notes,

      photos: data.photos,

      status: "submitted",
      inspectionRequired: false,
    });

    return Response.json(
      {
        ok: true,
        request: {
          id: cleaningRequest._id.toString(),
          reference: cleaningRequest.reference,
          status: cleaningRequest.status,
          requestedServices: cleaningRequest.requestedServices,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/cleaning-requests failed:", error);

    return Response.json(
      {
        error: "Unable to submit cleaning request.",
      },
      { status: 500 },
    );
  }
}
