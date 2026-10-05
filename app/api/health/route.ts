import { connectToDatabase } from "@/server/db/connect";

export const runtime = "nodejs";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();

    await mongoose.connection.db?.admin().ping();

    return Response.json(
      {
        ok: true,
        database: "connected",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return Response.json(
      {
        ok: false,
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
