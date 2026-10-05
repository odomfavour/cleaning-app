"use client";
import { forwardRef, useId, useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { AlertCircle, CalendarIcon, Eye, EyeOff, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";

export function Field({ label, error, hint, required, id, children, className }: {
  label?: string; error?: string; hint?: string; required?: boolean; id: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id}>
          {label}{required && <span className="text-destructive" aria-hidden> *</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-center gap-1.5 text-sm text-destructive"><AlertCircle className="size-3.5 shrink-0" />{error}</p>
      ) : hint ? <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type FieldProps = { label?: string; error?: string; hint?: string; wrapperClassName?: string };

export const Input = forwardRef<HTMLInputElement, FieldProps & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, hint, className, wrapperClassName, required, ...p }, ref) => {
    const uid = useId(); const id = p.id ?? uid;
    const [show, setShow] = useState(false);
    const isPw = p.type === "password";
    return (
      <Field id={id} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
        <div className="relative">
          <ShadcnInput ref={ref} id={id} required={required} {...p} type={isPw && show ? "text" : p.type}
            aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
            className={cn(isPw && "pr-11", className)} />
          {isPw && (
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      </Field>
    );
  });
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, hint, className, wrapperClassName, required, ...p }, ref) => {
    const uid = useId(); const id = p.id ?? uid;
    return (
      <Field id={id} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
        <ShadcnTextarea ref={ref} id={id} rows={4} {...p} aria-invalid={!!error} className={className} />
      </Field>
    );
  });
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, FieldProps & React.SelectHTMLAttributes<HTMLSelectElement> & { options?: { value: string; label: string }[]; placeholder?: string }>(
  ({ label, error, hint, className, wrapperClassName, required, options, placeholder, children, ...p }, ref) => {
    const uid = useId(); const id = p.id ?? uid;
    return (
      <Field id={id} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
        <NativeSelect ref={ref} id={id} {...p} aria-invalid={!!error} className={className}>
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          {children}
        </NativeSelect>
      </Field>
    );
  });
Select.displayName = "Select";

/** shadcn (Radix) checkbox with an inline label. Controlled: `checked` + `onCheckedChange`. */
export function Checkbox({ label, className, id, ...p }: { label: React.ReactNode } & React.ComponentProps<typeof ShadcnCheckbox>) {
  const uid = useId(); const cid = id ?? uid;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <ShadcnCheckbox id={cid} className="mt-0.5" {...p} />
      <Label htmlFor={cid} className="cursor-pointer items-start text-sm leading-snug font-normal text-foreground/80">{label}</Label>
    </div>
  );
}

/** `Checkbox` wired to react-hook-form. */
export function CheckboxField<T extends FieldValues>({ control, name, label, className }: { control: Control<T>; name: Path<T>; label: React.ReactNode; className?: string }) {
  return (
    <Controller control={control} name={name} render={({ field }) => (
      <Checkbox className={className} label={label} name={field.name} checked={!!field.value} onBlur={field.onBlur} onCheckedChange={(v) => field.onChange(v === true)} />
    )} />
  );
}

const toDate = (s?: string) => (s ? new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) : undefined);
const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** shadcn date picker (Popover + Calendar). Value is a `YYYY-MM-DD` string. */
export function DatePicker({ label, error, hint, required, wrapperClassName, id, value, onChange, onBlur, min, max, placeholder = "Pick a date", disabled }: FieldProps & {
  id?: string; value?: string; onChange?: (v: string) => void; onBlur?: () => void; min?: string; max?: string; placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  const uid = useId(); const fid = id ?? uid;
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  return (
    <Field id={fid} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) onBlur?.(); }}>
        <PopoverTrigger asChild>
          <Button id={fid} type="button" variant="outline" disabled={disabled} aria-invalid={!!error}
            aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
            className={cn("h-11 w-full justify-start px-3.5 text-[15px] font-normal text-foreground", !value && "text-muted-foreground", error && "border-destructive")}>
            <CalendarIcon className="text-muted-foreground" />
            {value ? fmtDate(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} defaultMonth={selected}
            disabled={[...(min ? [{ before: toDate(min)! }] : []), ...(max ? [{ after: toDate(max)! }] : [])]}
            onSelect={(d) => { if (d) { onChange?.(toStr(d)); setOpen(false); } }} />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

/** `DatePicker` wired to react-hook-form. */
export function DateField<T extends FieldValues>({ control, name, error, ...p }: Omit<React.ComponentProps<typeof DatePicker>, "value" | "onChange" | "onBlur"> & { control: Control<T>; name: Path<T> }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <DatePicker {...p} error={error ?? fieldState.error?.message} value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} />
    )} />
  );
}

const slots = Array.from({ length: 28 }, (_, i) => { const m = 6 * 60 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; });
const label12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
export const TimePicker = forwardRef<HTMLSelectElement, FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>>(
  (p, ref) => <Select ref={ref} placeholder="Select a time" options={slots.map((s) => ({ value: s, label: label12(s) }))} {...p} />);
TimePicker.displayName = "TimePicker";

/** Compact search box (shadcn `Input` with a leading icon). */
export function SearchInput({ label, className, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <ShadcnInput type="search" aria-label={label} className="h-10 pl-9 text-sm [&::-webkit-search-cancel-button]:appearance-none" {...p} />
    </div>
  );
}
