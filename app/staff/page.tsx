"use client";

import { CalendarCheck, CheckCircle2, Sun } from "lucide-react";

import { useStaffDashboard } from "@/lib/hooks/queries/use-staff-dashboard";

import {
  PageSkeleton,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/kit/Page";

import { Card } from "@/components/kit/Card";
import { JobCard } from "@/components/staff/JobCard";
import { fmtLong } from "@/lib/utils";

export default function StaffHome() {
  const { data, isLoading, error, refetch } = useStaffDashboard();

  if (isLoading && !data) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const { staff, stats, jobs } = data;

  return (
    <>
      <h1 className="text-2xl font-bold text-primary">Hi {staff.firstName}</h1>

      <p className="mb-5 text-sm text-muted-foreground">
        {fmtLong(new Date().toISOString())}
      </p>

      <div className="mb-7 grid grid-cols-3 gap-2.5">
        <StatCard label="Today" value={stats.today} icon={Sun} tone="amber" />

        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          icon={CalendarCheck}
          tone="blue"
        />

        <StatCard
          label="Done"
          value={stats.completed}
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-foreground">
          Today&apos;s jobs
        </h2>

        {jobs.today.length ? (
          <div className="space-y-3">
            {jobs.today.map((job) => (
              <JobCard key={job.id} job={job} customer={job.customer?.name} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={Sun}
              title="No jobs today"
              description="Enjoy the break. Upcoming jobs are listed below."
            />
          </Card>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-foreground">Upcoming</h2>

        {jobs.upcoming.length ? (
          <div className="space-y-3">
            {jobs.upcoming.map((job) => (
              <JobCard key={job.id} job={job} customer={job.customer?.name} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-foreground">
          Recently completed
        </h2>

        {jobs.completed.length ? (
          <div className="space-y-3">
            {jobs.completed.map((job) => (
              <JobCard key={job.id} job={job} customer={job.customer?.name} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Completed jobs show up here.
          </p>
        )}
      </section>
    </>
  );
}
