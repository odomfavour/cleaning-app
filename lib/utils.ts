import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

const D = (s: string) => new Date(s.length <= 10 ? s + "T00:00:00Z" : s);
export const fmtDate = (s?: string, o: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  s ? D(s).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" }) : "—";
export const fmtLong = (s?: string) => fmtDate(s, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtTime = (t?: string) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
