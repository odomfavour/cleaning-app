import { createServiceSchema } from "@/lib/validations/service";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningService } from "@/server/models/CleaningService";
import { serviceCode, slugify } from "@/server/utils/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    const services = await CleaningService.find({ active: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return Response.json(
      {
        ok: true,
        services: services.map((service) => ({
          id: service._id.toString(),
          name: service.name,
          description: service.description ?? "",
          guidance: service.guidance ?? "",
          duration: service.duration ?? "",
          active: service.active,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to load cleaning services:", error);

    return Response.json(
      {
        ok: false,
        message: "Unable to load cleaning services",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/services body:", body);
    const parsed = createServiceSchema.safeParse(body);
    console.log("POST /api/services parsed:", parsed);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid service data.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const slug = slugify(parsed.data.name);
    const code = serviceCode(parsed.data.name);

    const existing = await CleaningService.findOne({
      $or: [{ slug }, { code }],
    });

    if (existing) {
      return Response.json(
        { error: "A service with this name already exists." },
        { status: 409 },
      );
    }

    const lastService = await CleaningService.findOne()
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();

    const service = await CleaningService.create({
      ...parsed.data,
      slug,
      code,
      sortOrder: (lastService?.sortOrder ?? 0) + 1,
    });
    console.log("POST created service:", service.toObject());

    return Response.json(
      {
        service: {
          id: service._id.toString(),
          code: service.code,
          name: service.name,
          slug: service.slug,
          description: service.description ?? "",
          guidance: service.guidance ?? "",
          duration: service.duration ?? "",
          active: service.active,
          sortOrder: service.sortOrder,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/services failed:", error);

    return Response.json(
      { error: "Unable to create service." },
      { status: 500 },
    );
  }
}
