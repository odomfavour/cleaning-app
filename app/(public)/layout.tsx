import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/kit/Misc";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Cleanin home"><Logo /></Link>
          <nav className="ml-auto flex items-center gap-1 text-sm font-medium" aria-label="Main">
            <Link href="/" className="hidden items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted sm:flex"><ChevronLeft className="h-4 w-4" />Home</Link>
            <Link href="/request" className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted">Track a request</Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-primary hover:bg-brand-50">Log in</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-border bg-white py-5 text-center text-sm text-muted-foreground">© 2026 Cleanin Cleaning Services · Questions? Call +234 803 555 0142</footer>
    </div>
  );
}
