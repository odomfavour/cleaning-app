import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/** Lightweight dependency-free charts. Swap for recharts later if needed. */
export function BarChart({ data, format = (n) => String(n), height = 180, color = "bg-primary" }: { data: { label: string; value: number }[]; format?: (n: number) => string; height?: number; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const manyBars = data.length > 5;
  return (
    <div role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")} className="w-full overflow-hidden">
      <div className="flex items-end gap-1 sm:gap-2" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">{format(d.value)}</span>
            <div className={cn("w-full rounded-t-md transition-all", color, "group-hover:opacity-80")} style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 sm:gap-2">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              "flex-1 truncate text-center text-[10px] text-muted-foreground sm:text-[11px]",
              manyBars && i % 2 !== 0 && "hidden sm:block",
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HBars({ data, format = (n) => String(n) }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between text-sm"><span className="text-foreground/80">{d.label}</span><span className="font-medium tabular-nums text-foreground">{format(d.value)}</span></div>
          <Progress value={(d.value / max) * 100} aria-label={d.label} className="bg-muted" />
        </li>
      ))}
    </ul>
  );
}

const segColors = ["bg-primary", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-gray-400", "bg-rose-400"];
export function StackedBar({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={data.map((d) => `${d.label} ${d.value}`).join(", ")}>
        {data.map((d, i) => d.value > 0 && <div key={d.label} className={segColors[i % segColors.length]} style={{ width: `${(d.value / total) * 100}%` }} />)}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {data.map((d, i) => <li key={d.label} className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-sm", segColors[i % segColors.length])} /><span className="text-muted-foreground">{d.label}</span><span className="ml-auto font-medium tabular-nums text-foreground">{d.value}</span></li>)}
      </ul>
    </div>
  );
}

export function LineChart({ data, height = 160, format = (n) => String(n) }: { data: { label: string; value: number }[]; height?: number; format?: (n: number) => string }) {
  const W = 600, H = height, P = 8;
  const max = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => [P + (i / Math.max(data.length - 1, 1)) * (W - P * 2), H - P - (d.value / max) * (H - P * 2)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const manyLabels = data.length > 5;
  return (
    <div role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")} className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <path d={`${path} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`} fill="rgb(37 99 235 / 0.08)" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground sm:text-[11px]">
        {data.map((d, i) => (
          <span key={d.label} className={cn(manyLabels && i % 2 !== 0 && "hidden sm:block")}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
