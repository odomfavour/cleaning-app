import Link from "next/link";
import { AlertTriangle, ChevronLeft, Inbox, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
export { Skeleton };

export function PageHeader({ title, description, actions, back, meta }: {
  title: string; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string }; meta?: React.ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" />{back.label}</Link>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{title}</h1>{meta}
          </div>
          {description && <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, href, tone = "blue" }: {
  label: string; value: React.ReactNode; icon: LucideIcon; hint?: string; href?: string; tone?: "blue" | "amber" | "green" | "violet";
}) {
  const t = { blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700" }[tone];
  const body = (
    <Card className={cn("h-full flex-row items-start gap-2.5 p-3 shadow-none sm:gap-3.5 sm:p-5", href && "transition-colors hover:border-blue-300")}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10", t)}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-foreground sm:text-2xl">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-primary"><Icon className="h-6 w-6" /></div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-destructive"><AlertTriangle className="h-6 w-6" /></div>
      <h3 className="text-base font-semibold text-foreground">We couldn&apos;t load this</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message ?? "Check your connection and try again."}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function LoadingState({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-2/5" /><Skeleton className="h-3 w-3/5" /></div></div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
export const Spinner = ({ className }: { className?: string }) => <Loader2 className={cn("h-5 w-5 animate-spin", className)} aria-hidden />;
