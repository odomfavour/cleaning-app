import { Card as ShadcnCard, CardAction, CardContent, CardDescription, CardHeader as ShadcnCardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({ className, ...p }: React.ComponentProps<"div">) {
  return <ShadcnCard {...p} className={cn("gap-0 py-0 shadow-none", className)} />;
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <ShadcnCardHeader className={cn("border-b px-5 py-4 [.border-b]:pb-4", className)}>
      <CardTitle className="text-base leading-normal text-primary">
        <h2>{title}</h2>
      </CardTitle>
      {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
      {action && <CardAction>{action}</CardAction>}
    </ShadcnCardHeader>
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
