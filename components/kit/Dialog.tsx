"use client";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * shadcn Dialog (Radix) with the app's `open` / `onClose` API.
 * Modal on desktop, bottom sheet on mobile. Radix handles Esc, overlay click, focus trap and focus return.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: {
  open: boolean; onClose: () => void; title: string; description?: string; children?: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg";
}) {
  return (
    <ShadcnDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          // mobile: bottom sheet · sm+: centred modal
          "top-auto bottom-0 left-0 flex max-h-[92dvh] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-b-none rounded-t-2xl p-0",
          "data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:slide-out-to-bottom-8",
          "sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:data-[state=open]:slide-in-from-bottom-0",
          size === "sm" && "sm:max-w-md", size === "md" && "sm:max-w-lg", size === "lg" && "sm:max-w-2xl",
        )}
      >
        <DialogHeader className="px-5 pt-5 pr-12">
          <DialogTitle className="text-lg text-primary">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        {children && <div className="overflow-y-auto px-5 py-4">{children}</div>}
        {footer && <DialogFooter className="border-t px-5 py-4">{footer}</DialogFooter>}
        <div className="h-[env(safe-area-inset-bottom)] sm:hidden" />
      </DialogContent>
    </ShadcnDialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", tone = "primary", loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel?: string; tone?: "primary" | "danger"; loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Keep as is</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>} />
  );
}
