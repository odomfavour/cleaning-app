"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardCheck, Home, User } from "lucide-react";
import { Logo, Avatar } from "@/components/kit/Misc";
import { NotificationPanel } from "@/components/shared/NotificationPanel";
import { BottomNav, type NavItem } from "@/components/shared/AppShell";
import { useCurrentUser } from "@/lib/hooks/queries/use-auth";
import { cn } from "@/lib/utils";

const nav: NavItem[] = [
  { href: "/staff", label: "Today", icon: Home, exact: true },
  { href: "/staff/jobs", label: "My jobs", icon: Briefcase },
  { href: "/staff/profile", label: "Profile", icon: User },
  {
    href: "/staff/inspections",
    label: "Inspections",
    icon: ClipboardCheck,
  },
];

/** Mobile-first: bottom tabs on phones, top links on larger screens. */
export function StaffShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data: user } = useCurrentUser();
  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Link href="/staff" aria-label="Staff home">
            <Logo />
          </Link>
          <nav className="ml-6 hidden gap-1 sm:flex" aria-label="Main">
            {nav.map((n) => {
              const a = n.exact ? path === n.href : path.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={a ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    a
                      ? "bg-brand-50 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <NotificationPanel audience="staff" />
            <Avatar name={user?.name ?? "Staff account"} size="sm" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 sm:pb-10 sm:pt-8">
        {children}
      </main>
      <div className="sm:hidden">
        <BottomNav items={nav} path={path} />
      </div>
    </div>
  );
}
