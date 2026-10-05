"use client";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import { ErrorState, EmptyState, PageSkeleton } from "@/components/kit/Page";
import { Tabs } from "@/components/kit/Tabs";
import { JobCard } from "@/components/staff/JobCard";
import { useStaffDashboard } from "@/lib/hooks/queries/use-staff-dashboard";
import { getApiErrorMessage } from "@/lib/api/errors";

type Tab = "active" | "completed" | "all";
export default function StaffJobs() {
  const [tab, setTab] = useState<Tab>("active");
  const query = useStaffDashboard();
  const allJobs = query.data?.jobs.all ?? [];
  const jobs = allJobs.filter((job) =>
    tab === "all" ||
    (tab === "completed"
      ? job.status === "completed"
      : !["completed", "cancelled"].includes(job.status)),
  );

  if (query.isLoading && !query.data) return <PageSkeleton />;

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-primary">My jobs</h1>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "all", label: "All" }]} className="mb-4" />
      {query.error ? (
        <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : !jobs.length ? (
        <EmptyState icon={Briefcase} title="No jobs here" description="Jobs assigned to your staff profile will appear in this list." />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} customer={job.customer?.name} />)}
        </div>
      )}
    </>
  );
}
