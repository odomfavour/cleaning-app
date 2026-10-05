"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Dialog } from "@/components/kit/Dialog";
import { CheckboxCard } from "@/components/kit/Choice";
import { Button } from "@/components/kit/Button";
import { Avatar } from "@/components/kit/Misc";
import { StatusBadge } from "@/components/kit/Badge";
import { generic } from "@/lib/status";
import type { Booking, Staff } from "@/lib/types";

/** Pick one or more staff for a booking. Staff already booked at the same time are flagged. */
export function StaffAssignmentDialog({ open, onClose, onDone, booking, staff, allBookings }: {
  open: boolean; onClose: () => void; onDone: () => void; booking: Booking; staff: Staff[]; allBookings: Booking[];
}) {
  const [sel, setSel] = useState<string[]>(booking.staffIds);
  const [busy, setBusy] = useState(false);
  const clash = (s: Staff) => allBookings.some((b) => b.id !== booking.id && b.date === booking.date && b.staffIds.includes(s.id) && !["completed", "cancelled"].includes(b.status));
  const pool = staff.filter((s) => s.status === "active" && s.role !== "Inspector");
  const toggle = (id: string) => setSel((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  const save = async () => { setBusy(true); await api.bookings.assignStaff(booking.id, sel); setBusy(false); toast.success(sel.length ? `${sel.length} staff assigned` : "Staff removed"); onDone(); onClose(); };
  return (
    <Dialog open={open} onClose={onClose} title="Assign staff" description="Select everyone who will work this job." size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Save ({sel.length} selected)</Button></>}>
      <ul className="space-y-2">
        {pool.map((s) => { const on = sel.includes(s.id); const busyDay = clash(s); return (
          <li key={s.id}>
            <CheckboxCard checked={on} onCheckedChange={() => toggle(s.id)} className="flex items-center p-3" itemClassName="order-last ml-0 mt-0">
              <Avatar name={s.name} size="sm" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{s.name}</span><span className="block text-xs text-muted-foreground">{s.role}{busyDay ? " · has another job this day" : ""}</span></span>
              <StatusBadge status={s.availability} map={generic} />
            </CheckboxCard></li>); })}
      </ul>
    </Dialog>
  );
}
