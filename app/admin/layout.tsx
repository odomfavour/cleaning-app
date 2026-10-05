"use client";
import { BarChart3, CalendarCheck, CalendarDays, ClipboardList, CreditCard, FileText, LayoutDashboard, Search, Settings, Sparkles, Star, UserCog, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/AppShell";
import { useCurrentUser } from "@/lib/hooks/queries/use-auth";

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/inspections", label: "Inspections", icon: Search },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  return <AppShell portal="Admin" audience="admin" nav={nav} bottomNav={[nav[0], nav[1], nav[4], nav[5]].map((n) => ({ ...n }))} user={{ name: user?.name ?? "Administrator", sub: user?.email ?? "" }}>{children}</AppShell>;
}
