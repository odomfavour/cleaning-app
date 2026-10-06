import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
};
const dots: Record<Tone, string> = {
  neutral: "bg-gray-400",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  purple: "bg-violet-500",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <ShadcnBadge variant="outline" className={cn(tones[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </ShadcnBadge>
  );
}

export function StatusBadge({
  status,
  map,
}: {
  status: string;
  map: Record<string, { label: string; tone: Tone }>;
}) {
  const m = map[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}
