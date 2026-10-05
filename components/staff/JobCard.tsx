import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { bookingStatus } from "@/lib/status";
import type { StaffDashboardJob } from "@/lib/api/services/staff-dashboard.service";
import { fmtDate, fmtTime } from "@/lib/utils";

export function JobCard({ job, customer }: { job: StaffDashboardJob; customer?: string }) {
  const status = job.status === "assigned" ? "staff_assigned" : job.status;
  const isToday = job.date
    ? new Date(job.date).toDateString() === new Date().toDateString()
    : false;

  return (
    <Link href={`/staff/jobs/${job.id}`} className="block rounded-xl">
    <Card className="p-4 transition-colors active:bg-muted">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-base font-semibold text-primary">{job.title}</p>{customer && <p className="text-sm text-muted-foreground">{customer}</p>}</div><StatusBadge status={status} map={bookingStatus} /></div>
      <div className="mt-3 space-y-1.5 text-sm text-foreground/80"><p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground/70" />{isToday ? "Today" : fmtDate(job.date ?? undefined)}, {fmtTime(job.time ?? undefined)}</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" /><span className="line-clamp-2">{job.location}</span></p></div>
      <p className="mt-3 flex items-center justify-end text-sm font-medium text-blue-700">Open job<ChevronRight className="h-4 w-4" /></p>
    </Card>
    </Link>
  );
}
