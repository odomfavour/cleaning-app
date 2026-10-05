import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest, Customer } from "@/server/models";
import { User } from "@/server/models/User";
import {
  REQUEST_ACCESS_COOKIE_NAME,
  verifyRequestAccessToken,
} from "@/server/auth/request-access";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(30),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/\d/),
});

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Enter valid account details and a password with at least 8 characters, one uppercase letter, and one number." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const email = parsed.data.email.toLowerCase().trim();
    const [existingUser, existingCustomer] = await Promise.all([
      User.findOne({ email }).select("_id").lean(),
      Customer.findOne({ email }).select("_id hasAccount status").exec(),
    ]);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists. Log in instead." },
        { status: 409 },
      );
    }

    if (existingCustomer) {
      if (existingCustomer.hasAccount) {
        return NextResponse.json(
          { message: "An account with this email already exists. Log in instead." },
          { status: 409 },
        );
      }

      if (existingCustomer.status === "blocked") {
        return NextResponse.json(
          { message: "This customer account cannot create a login." },
          { status: 403 },
        );
      }

      const token = (await cookies()).get(REQUEST_ACCESS_COOKIE_NAME)?.value;
      const access = token ? verifyRequestAccessToken(token) : null;
      const ownsVerifiedRequest = access && access.customerId === existingCustomer._id.toString()
        ? await CleaningRequest.exists({
            _id: access.requestId,
            customerId: existingCustomer._id,
          })
        : null;

      if (!ownsVerifiedRequest) {
        return NextResponse.json(
          {
            message: "This email is linked to a previous guest request. Track and verify that request before creating an account.",
          },
          { status: 409 },
        );
      }
    }

    const createdCustomer = !existingCustomer;
    const customer = existingCustomer ?? await Customer.create({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email,
      phone: parsed.data.phone,
      hasAccount: false,
      status: "active",
    });
    let createdUser: InstanceType<typeof User> | undefined;

    try {
      createdUser = await User.create({
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "customer",
        active: true,
        customerId: customer._id,
      });

      customer.firstName = parsed.data.firstName;
      customer.lastName = parsed.data.lastName;
      customer.phone = parsed.data.phone;
      customer.hasAccount = true;
      customer.userId = createdUser._id;
      await customer.save();
      await createSession(createdUser._id.toString());

      return NextResponse.json(
        {
          user: {
            id: createdUser._id.toString(),
            email: createdUser.email,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            phone: customer.phone ?? "",
            role: createdUser.role,
            customerId: customer._id.toString(),
          },
          redirect: "/dashboard",
        },
        { status: 201 },
      );
    } catch (error) {
      if (createdUser) await User.deleteOne({ _id: createdUser._id });

      if (createdCustomer) {
        await Customer.deleteOne({ _id: customer._id });
      } else {
        customer.hasAccount = false;
        customer.userId = undefined;
        await customer.save();
      }

      throw error;
    }
  } catch (error) {
    console.error("POST /api/auth/register failed:", error);

    return NextResponse.json(
      { message: "Unable to create your account right now. Please try again." },
      { status: 500 },
    );
  }
}