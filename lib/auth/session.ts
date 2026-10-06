import { connectToDatabase } from "@/server/db/connect";
import { Session } from "@/server/models/Session";
import { User } from "@/server/models/User";
import { Customer, StaffProfile } from "@/server/models";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

const SESSION_COOKIE = "cleanin-session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  await connectToDatabase();

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  await connectToDatabase();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await Session.deleteOne({
      tokenHash: hashToken(token),
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  await connectToDatabase();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!session) {
    return null;
  }

  const user = await User.findOne({
    _id: session.userId,
    active: true,
  })
    .select("_id email role active customerId staffProfileId")
    .lean();

  if (!user) {
    return null;
  }

  const profile = user.customerId
    ? await Customer.findById(user.customerId)
        .select("firstName lastName phone")
        .lean()
    : user.staffProfileId
      ? await StaffProfile.findById(user.staffProfileId)
          .select("firstName lastName phone")
          .lean()
      : null;

  const name = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user.email.split("@")[0] || user.email;

  return {
    id: user._id.toString(),
    email: user.email,
    name,
    phone: profile?.phone ?? "",
    role: user.role as "customer" | "admin" | "staff",
    active: user.active,
    customerId: user.customerId?.toString(),
    staffProfileId: user.staffProfileId?.toString(),
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function requireRole(
  allowedRoles: Array<"admin" | "staff" | "customer">,
) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
