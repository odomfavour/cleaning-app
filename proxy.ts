import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { protectedPageRole } from "@/lib/auth/route-access";

export async function proxy(request: NextRequest) {
  const requiredRole = protectedPageRole(request.nextUrl.pathname);
  if (!requiredRole) return NextResponse.next();

  const user = await getCurrentUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (user.role !== requiredRole) {
    const home = user.role === "customer" ? "/dashboard" : `/${user.role}`;
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/staff/:path*"],
};
