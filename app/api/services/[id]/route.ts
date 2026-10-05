import { isValidObjectId } from "mongoose";
import { CleaningService } from "@/server/models";
import { connectToDatabase } from "@/server/db/connect";
import { updateServiceSchema } from "@/lib/validations/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return Response.json({ error: "Invalid service ID." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);

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

    const service = await CleaningService.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!service) {
      return Response.json({ error: "Service not found." }, { status: 404 });
    }

    return Response.json({
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
    });
  } catch (error) {
    console.error("PATCH /api/services/:id failed:", error);

    return Response.json(
      { error: "Unable to update service." },
      { status: 500 },
    );
  }
}
