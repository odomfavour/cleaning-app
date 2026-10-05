"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Phone, Mail, Star } from "lucide-react";
import { useStaffDashboard } from "@/lib/hooks/queries/use-staff-dashboard";
import { useLogout } from "@/lib/hooks/queries/use-auth";
import { PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, DetailList } from "@/components/kit/Card";
import { Avatar, Switch } from "@/components/kit/Misc";
import { StatusBadge } from "@/components/kit/Badge";
import { generic } from "@/lib/status";
import { updateStaffAvailability } from "@/lib/api/services/staff-dashboard.service";
import { getApiErrorMessage } from "@/lib/api/errors";

export default function StaffProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useStaffDashboard();
  const availabilityMutation = useMutation({
    mutationFn: updateStaffAvailability,
    onSuccess: async (staff) => {
      queryClient.setQueryData(["staff", "dashboard"], (current: typeof profileQuery.data) =>
        current ? { ...current, staff } : current,
      );
      toast.success(staff.availability === "off_duty" ? "You’re off duty" : "You’re available");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const logout = useLogout();
  const data = profileQuery.data;
  const s = data?.staff;

  if (profileQuery.isLoading && !s) return <PageSkeleton />;
  if (profileQuery.error || !data || !s) {
    return <ErrorState message={getApiErrorMessage(profileQuery.error)} onRetry={() => void profileQuery.refetch()} />;
  }

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold text-primary">Profile</h1>
      <Card className="mb-4"><CardBody className="flex items-center gap-4"><Avatar name={s.name} size="lg" /><div><p className="text-lg font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.role}</p><div className="mt-1.5"><StatusBadge status={s.availability} map={generic} /></div></div></CardBody></Card>
      <Card className="mb-4"><CardBody className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-bold">{data.stats.completed}</p><p className="text-xs text-muted-foreground">Jobs done</p></div><div><p className="text-xl font-bold">{data.stats.today + data.stats.upcoming}</p><p className="text-xs text-muted-foreground">Active</p></div><div><p className="flex items-center justify-center gap-1 text-xl font-bold">{s.rating}<Star className="h-4 w-4 fill-amber-400 text-amber-400" /></p><p className="text-xs text-muted-foreground">Rating</p></div></CardBody></Card>
      <Card className="mb-4"><CardBody><DetailList cols={1} items={[{ label: "Phone", value: <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground/70" />{s.phone}</span> }, { label: "Email", value: <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground/70" />{s.email}</span> }]} /></CardBody></Card>
      <Card className="mb-6"><CardBody className="py-2"><Switch label="Available for new jobs" description="Turn off when you're not working." checked={s.availability !== "off_duty"} onChange={(value) => availabilityMutation.mutate(value ? "available" : "off_duty")} /></CardBody></Card>
      <Button variant="secondary" full size="lg" loading={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}><LogOut className="h-4 w-4" />Log out</Button>
    </>
  );
}
