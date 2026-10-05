"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export { RadioGroup };

const card =
  "w-full cursor-pointer gap-3 rounded-lg border p-3.5 text-left font-normal leading-normal transition-colors hover:border-border " +
  "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-brand-50 has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary " +
  "has-focus-visible:ring-[3px] has-focus-visible:ring-ring/40";

/** Selectable card built from shadcn `RadioGroupItem`. Place inside `<RadioGroup>`. */
export function RadioCard({ value, children, className, itemClassName }: { value: string; children: React.ReactNode; className?: string; itemClassName?: string }) {
  const id = useId();
  return (
    <Label htmlFor={id} className={cn(card, className)}>
      {children}
      <RadioGroupItem id={id} value={value} className={cn("ml-auto", itemClassName)} />
    </Label>
  );
}

/** Selectable card built from shadcn `Checkbox`. */
export function CheckboxCard({ checked, onCheckedChange, children, className, itemClassName }: { checked: boolean; onCheckedChange: (v: boolean) => void; children: React.ReactNode; className?: string; itemClassName?: string }) {
  const id = useId();
  return (
    <Label htmlFor={id} className={cn(card, "items-start", className)}>
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} className={cn("order-first mt-0.5 size-5", itemClassName)} />
      {children}
    </Label>
  );
}
