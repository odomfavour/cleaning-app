import { Card as ShadcnCard, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({ className, ...p }: React.ComponentProps<"div">) {
  return <ShadcnCard {...p} className={cn("gap-0 overflow-hidden py-0 shadow-none", className)} />;
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-start justify-between gap-3 border-b px-5 py-4", className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-normal text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export const CardBody = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <CardContent className={cn("p-5", className)}>{children}</CardContent>
);

export function DetailList({ items, cols = 2 }: { items: { label: string; value: React.ReactNode }[]; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-8 gap-y-4", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3")}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">{i.label}</dt>
          <dd className="mt-0.5 break-words text-[15px] text-foreground">{i.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
