export function protectedPageRole(pathname: string) {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "customer";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/staff" || pathname.startsWith("/staff/")) return "staff";
  return null;
}

export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\x00-\x20]/.test(value) || /%2f|%5c|%0[ad]/i.test(value)) return null;
  return value;
}
