import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { Booking, Review } from "@/server/models";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(5000).optional().default(""),
  photos: z.array(z.string().url()).max(4).optional().default([]),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer" || !user.customerId) {
      return NextResponse.json(
        { message: "Customer access required." },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Provide a rating from 1 to 5." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const booking = await Booking.findOne({
      _id: id,
      customerId: user.customerId,
      status: "completed",
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Only your completed bookings can be reviewed." },
        { status: 404 },
      );
    }

    if (await Review.exists({ bookingId: booking._id })) {
      return NextResponse.json(
        { message: "You have already reviewed this booking." },
        { status: 409 },
      );
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: user.customerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      photos: parsed.data.photos,
    });

    return NextResponse.json(
      {
        review: {
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment ?? "",
          photos: review.photos ?? [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/customer/bookings/[id]/review failed:", error);
    return NextResponse.json(
      { message: "Unable to submit your review." },
      { status: 500 },
    );
  }
}
