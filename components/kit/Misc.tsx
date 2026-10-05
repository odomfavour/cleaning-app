import { Star } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Avatar as ShadcnAvatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const palette = ["bg-blue-100 text-blue-800", "bg-emerald-100 text-emerald-800", "bg-violet-100 text-violet-800", "bg-amber-100 text-amber-800", "bg-rose-100 text-rose-800", "bg-cyan-100 text-cyan-800"];
  const c = palette[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % palette.length];
  return (
    <ShadcnAvatar aria-hidden className={cn(size === "sm" && "size-8", size === "md" && "size-10", size === "lg" && "size-16", className)}>
      <AvatarFallback className={cn("font-semibold", c, size === "sm" && "text-xs", size === "md" && "text-sm", size === "lg" && "text-xl")}>{initials(name)}</AvatarFallback>
    </ShadcnAvatar>
  );
}

export function Stars({ value, onChange, size = 18 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star style={{ width: size, height: size }} className={cn(n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300")} />;
        return onChange
          ? <Button key={n} type="button" variant="ghost" size="icon" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)} className="size-auto rounded p-1 transition-transform hover:scale-110 hover:bg-transparent">{icon}</Button>
          : <span key={n}>{icon}</span>;
      })}
    </div>
  );
}

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700">
        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="12" r="2" fill="#1d4ed8" /></svg>
      </span>
      <span className="leading-tight">
        <span className={cn("block text-xl font-bold", light ? "text-white" : "text-foreground")}>Cleanin</span>
        <span className={cn("block text-[11px]", light ? "text-blue-200" : "text-blue-600")}>Cleaning Services</span>
      </span>
    </span>
  );
}

export function Money({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", strong ? "text-lg font-bold text-primary" : "text-sm text-foreground/80")}>
      <span>{label}</span><span className={cn("tabular-nums", negative && "text-emerald-700")}>{value}</span>
    </div>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0"><p className="text-sm font-medium text-foreground">{label}</p>{description && <p className="text-sm text-muted-foreground">{description}</p>}</div>
      <ShadcnSwitch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
