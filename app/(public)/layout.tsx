import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/kit/Misc";
import { HeaderMenu } from "@/components/shared/HeaderMenu";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Cleanin home"><Logo /></Link>
          <HeaderMenu links={[{ href: "/", label: "Home" }, { href: "/request-cleaning", label: "Request a cleaning" }, { href: "/request", label: "Track a request" }, { href: "/login", label: "Log in" }]} />
          <nav className="ml-auto hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Main">
            <Link href="/" className="hidden items-center gap-1 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted sm:flex"><ChevronLeft className="h-4 w-4" />Home</Link>
            <Link href="/request" className="rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted">Track a request</Link>
            <Link href="/login" className="rounded-lg px-3 py-2.5 text-primary hover:bg-brand-50">Log in</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-border bg-white py-5 text-center text-sm text-muted-foreground">© 2026 Cleanin Cleaning Services · Questions? Call +234 803 555 0142</footer>
    </div>
  );
}
