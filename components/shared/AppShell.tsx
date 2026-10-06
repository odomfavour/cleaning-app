"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, MoreHorizontal, Plus, X, type LucideIcon } from "lucide-react";
import { Button as UiButton } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo, Avatar } from "@/components/kit/Misc";
import { Button } from "@/components/kit/Button";
import { NotificationPanel } from "./NotificationPanel";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface NavItem { href: string; label: string; icon: LucideIcon; exact?: boolean }

const isActive = (path: string, n: NavItem) => (n.exact ? path === n.href : path === n.href || path.startsWith(n.href + "/"));

function NavList({ items, path, onNavigate }: { items: NavItem[]; path: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {items.map((n) => {
        const a = isActive(path, n);
        return (
          <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={a ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", a ? "bg-white/12 text-white" : "text-blue-100/80 hover:bg-white/8 hover:text-white")}>
            <n.icon className="h-[18px] w-[18px] shrink-0" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar (desktop) + drawer (mobile) + optional bottom tab bar. */
export function AppShell({ nav, bottomNav, audience, user, cta, portal, children }: {
  nav: NavItem[]; bottomNav?: NavItem[]; audience: Role; user: { name: string; sub: string }; portal: string;
  cta?: { href: string; label: string }; children: React.ReactNode;
}) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);

  const sidebar = (inDrawer: boolean) => (
    <div className="flex h-full flex-col bg-primary text-white">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link href="/" aria-label="Cleanin home" onClick={() => setDrawer(false)}><Logo light /></Link>
        {inDrawer && (
          <SheetClose asChild>
            <UiButton variant="ghost" size="icon" className="size-9 text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Close menu"><X /></UiButton>
          </SheetClose>
        )}
      </div>
      <p className="px-5 pb-2 pt-3 text-xs font-medium text-blue-200/70">{portal}</p>
      <div className="flex-1 overflow-y-auto px-3 pb-4"><NavList items={nav} path={path} onNavigate={() => setDrawer(false)} /></div>
      <Separator className="bg-white/10" />
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar name={user.name} size="sm" className="bg-white text-primary" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-blue-200/80">{user.sub}</p></div>
          <UiButton asChild variant="ghost" size="icon" className="size-9 text-blue-100 hover:bg-white/10 hover:text-white">
            <Link href="/login" aria-label="Log out"><LogOut /></Link>
          </UiButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar(false)}</aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" showCloseButton={false} className="w-72 max-w-[85vw] gap-0 border-0 p-0 lg:hidden">
          <SheetTitle className="sr-only">{portal} menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate between sections</SheetDescription>
          {sidebar(true)}
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <UiButton variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="size-5" /></UiButton>
          <Link href="/" className="lg:hidden" aria-label="Cleanin home"><Logo /></Link>
          <div className="ml-auto flex items-center gap-2">
            {cta && <><Button href={cta.href} size="sm" className="hidden sm:inline-flex"><Plus />{cta.label}</Button></>}
            <NotificationPanel audience={audience} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
      {bottomNav && <BottomNav items={bottomNav} path={path} onMore={() => setDrawer(true)} />}
    </div>
  );
}

export function BottomNav({ items, path, onMore }: { items: NavItem[]; path: string; onMore?: () => void }) {
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {items.map((n) => {
          const a = isActive(path, n);
          return (
            <li key={n.href} className="flex-1">
              <Link href={n.href} aria-current={a ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", a ? "text-primary" : "text-muted-foreground")}>
                <n.icon className={cn("h-5 w-5", a && "stroke-[2.4]")} />{n.label}
              </Link>
            </li>
          );
        })}
        {onMore && <li className="flex-1"><UiButton variant="ghost" onClick={onMore} className="h-16 w-full flex-col gap-1 rounded-none text-[11px] font-medium text-muted-foreground"><MoreHorizontal className="size-5" />More</UiButton></li>}
      </ul>
    </nav>
  );
}
