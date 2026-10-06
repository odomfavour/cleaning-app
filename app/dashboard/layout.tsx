"use client";
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  User,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/AppShell";
import { useCurrentUser } from "@/lib/hooks/queries/use-auth";

const nav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/requests", label: "My requests", icon: ClipboardList },
  { href: "/dashboard/bookings", label: "My bookings", icon: CalendarCheck },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: me } = useCurrentUser();
  return (
    <AppShell
      portal="Customer portal"
      audience="customer"
      nav={[
        ...nav.slice(0, 2),
        {
          href: "/dashboard/request-cleaning",
          label: "Request a cleaning",
          icon: PlusCircle,
        },
        ...nav.slice(2),
      ]}
      user={{ name: me?.name ?? "Your account", sub: me?.email ?? "" }}
      cta={{ href: "/dashboard/request-cleaning", label: "Request a cleaning" }}
    >
      {children}
    </AppShell>
  );
}
