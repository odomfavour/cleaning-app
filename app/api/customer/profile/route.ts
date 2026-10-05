import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Customer } from "@/server/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^\+?[\d\s]{10,16}$/),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json({ message: "Customer access required." }, { status: 403 });
    }

    await connectToDatabase();
    const customer = await Customer.findById(user.customerId)
      .select("firstName lastName email phone createdAt")
      .lean();

    if (!customer) return NextResponse.json({ message: "Customer profile not found." }, { status: 404 });

    return NextResponse.json({
      profile: {
        id: customer._id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        createdAt: customer.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/customer/profile failed:", error);
    return NextResponse.json({ message: "Unable to load your profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json({ message: "Customer access required." }, { status: 403 });
    }

    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Enter a valid name and phone number." }, { status: 400 });
    }

    await connectToDatabase();
    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $set: parsed.data },
      { new: true, runValidators: true },
    ).select("firstName lastName email phone createdAt");

    if (!customer) return NextResponse.json({ message: "Customer profile not found." }, { status: 404 });

    return NextResponse.json({
      profile: {
        id: customer._id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        createdAt: customer.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/customer/profile failed:", error);
    return NextResponse.json({ message: "Unable to save your profile." }, { status: 500 });
  }
}