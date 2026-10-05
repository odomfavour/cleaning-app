import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { AuthRole } from "../types";

export async function getAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

export async function getAuthorizedUser(allowedRoles: AuthRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "You do not have permission to perform this action." },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

export async function requireAdmin() {
  return getAuthorizedUser(["admin"]);
}
