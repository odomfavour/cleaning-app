"use client";
import { cn } from "@/lib/utils";
import { Tabs as ShadcnTabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Underlined tab bar built on shadcn/Radix Tabs (keyboard arrows, roving focus, aria wired up). Content is rendered by the page. */
export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <ShadcnTabs value={value} onValueChange={(v) => onChange(v as T)} className={className}>
      <TabsList className="-mx-4 h-auto w-auto justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}
            className="-mb-px h-auto flex-none shrink-0 gap-2 rounded-none border-0 border-b-2 border-transparent px-3.5 py-3 text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-xs", t.value === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{t.count}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
  );
}

/** Pill-style switcher (shadcn Tabs default look). */
export function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <ShadcnTabs value={value} onValueChange={(v) => onChange(v as T)} className="inline-flex">
      <TabsList className="h-auto p-1">
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value} className="px-3.5 py-1.5 data-[state=active]:text-primary">{o.label}</TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
  );
}
