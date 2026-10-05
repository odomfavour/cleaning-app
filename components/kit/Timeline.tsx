import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem { title: string; description?: string; date?: string; state: "done" | "current" | "upcoming" | "skipped" }

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={it.title} className="relative flex gap-4 pb-6 last:pb-0" aria-current={it.state === "current" ? "step" : undefined}>
            {!last && <span aria-hidden className={cn("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", it.state === "done" ? "bg-emerald-500" : "bg-gray-200")} />}
            <span className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
              it.state === "done" && "border-emerald-500 bg-emerald-500 text-white",
              it.state === "current" && "border-primary bg-white text-primary ring-4 ring-blue-100",
              it.state === "upcoming" && "border-border bg-white text-gray-300",
              it.state === "skipped" && "border-border bg-muted/40 text-gray-300")}>
              {it.state === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Circle className={cn("h-2.5 w-2.5", it.state === "current" && "fill-current")} />}
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn("text-sm font-semibold", it.state === "upcoming" || it.state === "skipped" ? "text-muted-foreground/70" : "text-foreground")}>
                {it.title}{it.state === "skipped" && <span className="ml-2 text-xs font-normal">Not needed</span>}
              </p>
              {it.description && <p className="mt-0.5 text-sm text-muted-foreground">{it.description}</p>}
              {it.date && <p className="mt-0.5 text-xs text-muted-foreground">{it.date}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact horizontal tracker for booking progress (scrolls on small screens). */
export function ProgressTracker({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start gap-0 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current, cur = i === current;
        return (
          <li key={s} className="relative flex min-w-[84px] flex-1 flex-col items-center text-center" aria-current={cur ? "step" : undefined}>
            {i > 0 && <span aria-hidden className={cn("absolute right-1/2 top-4 h-0.5 w-full", i <= current ? "bg-emerald-500" : "bg-gray-200")} />}
            <span className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
              done && "border-emerald-500 bg-emerald-500 text-white", cur && "border-primary bg-primary text-white ring-4 ring-blue-100", !done && !cur && "border-border bg-white text-muted-foreground/70")}>
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("mt-2 px-1 text-xs leading-tight", cur ? "font-semibold text-foreground" : done ? "text-foreground/80" : "text-muted-foreground/70")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
