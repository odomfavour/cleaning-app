import { Logo } from "@/components/kit/Misc";

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background px-6 py-12 text-center"
    >
      <Logo />
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="size-10 rounded-full border-[3px] border-brand-100 border-t-brand motion-safe:animate-spin motion-reduce:animate-none"
        />
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
