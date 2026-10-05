"use client";

import { useState } from "react";
import { Phone, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  useAdminStaff,
  useCreateAdminStaff,
  useUpdateAdminStaff,
} from "@/lib/hooks/queries/use-admin-staff";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { Avatar } from "@/components/kit/Misc";
import { Dialog, ConfirmDialog } from "@/components/kit/Dialog";
import { Input, Select } from "@/components/kit/Field";
import { generic } from "@/lib/status";
import { cn } from "@/lib/utils";
import { AdminStaff } from "@/lib/api/services/admin-staff.service";

const roles = ["Cleaner", "Team Lead", "Inspector", "Driver"] as const;

const availabilityOptions = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "on_job",
    label: "On a job",
  },
  {
    value: "off_duty",
    label: "Off duty",
  },
] as const;

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter a first name")
    .max(100, "First name is too long"),

  lastName: z
    .string()
    .trim()
    .min(1, "Enter a last name")
    .max(100, "Last name is too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Phone number is too long"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(320, "Email is too long"),

  role: z.enum(roles),

  availability: z.enum(["available", "on_job", "off_duty"]),
});

type FormValues = z.infer<typeof schema>;

type EditingStaff = AdminStaff | "new" | null;

const emptyValues: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  role: "Cleaner",
  availability: "available",
};

export default function StaffPage() {
  const { data: staff = [], isLoading, error, refetch } = useAdminStaff();

  const createMutation = useCreateAdminStaff();
  const updateMutation = useUpdateAdminStaff();

  const [edit, setEdit] = useState<EditingStaff>(null);
  const [off, setOff] = useState<AdminStaff | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const open = (member: EditingStaff) => {
    setEdit(member);

    if (member === "new") {
      form.reset(emptyValues);
      return;
    }

    if (member) {
      form.reset({
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email,
        role: member.role,
        availability: member.availability,
      });
    }
  };

  const close = () => {
    setEdit(null);
    form.reset(emptyValues);
  };

  const save = form.handleSubmit(async (values) => {
    try {
      if (edit === "new") {
        await createMutation.mutateAsync(values);

        toast.success("Staff member added.");
      } else if (edit) {
        await updateMutation.mutateAsync({
          id: edit.id,
          input: values,
        });

        toast.success("Changes saved.");
      }

      close();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save staff member.",
      );
    }
  });

  const toggleActive = async () => {
    if (!off) return;

    try {
      await updateMutation.mutateAsync({
        id: off.id,
        input: {
          active: !off.active,
          availability: off.active ? "off_duty" : "available",
        },
      });

      toast.success(
        off.active ? "Staff member deactivated." : "Staff member reactivated.",
      );

      setOff(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update staff member.",
      );
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Unable to load staff."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const errors = form.formState.errors;

  return (
    <>
      <PageHeader
        title="Staff"
        description="Your cleaning teams, inspectors and drivers."
        actions={
          <Button onClick={() => open("new")}>
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-medium text-foreground">No staff members yet.</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Add your first staff member to start assigning cleaning jobs and
            inspections.
          </p>

          <Button className="mt-4" onClick={() => open("new")}>
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <Card
              key={member.id}
              className={cn("p-5", !member.active && "bg-muted/40")}
            >
              <div className="flex items-start gap-3.5">
                <Avatar
                  name={member.name}
                  size="lg"
                  className={!member.active ? "opacity-50" : ""}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {member.name}
                  </p>

                  <p className="text-sm text-muted-foreground">{member.role}</p>

                  <a
                    href={`tel:${member.phone}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {member.phone}
                  </a>
                </div>

                <StatusBadge
                  status={!member.active ? "inactive" : member.availability}
                  map={generic}
                />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <dd className="text-lg font-bold text-foreground">
                    {member.activeJobs}
                  </dd>
                  <dt className="text-xs text-muted-foreground">Active</dt>
                </div>

                <div>
                  <dd className="text-lg font-bold text-foreground">
                    {member.completedJobs}
                  </dd>
                  <dt className="text-xs text-muted-foreground">Completed</dt>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => open(member)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className={
                    member.active
                      ? "text-red-700 hover:bg-red-50"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }
                  onClick={() => setOff(member)}
                >
                  {member.active ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!edit}
        onClose={close}
        title={edit === "new" ? "Add staff member" : "Edit staff member"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={isSaving}>
              Cancel
            </Button>

            <Button onClick={save} loading={isSaving}>
              {edit === "new" ? "Add staff" : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              error={errors.firstName?.message}
              {...form.register("firstName")}
            />

            <Input
              label="Last name"
              error={errors.lastName?.message}
              {...form.register("lastName")}
            />
          </div>

          <Input
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...form.register("phone")}
          />

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...form.register("email")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              options={roles.map((role) => ({
                value: role,
                label: role,
              }))}
              error={errors.role?.message}
              {...form.register("role")}
            />

            <Select
              label="Availability"
              options={availabilityOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              error={errors.availability?.message}
              {...form.register("availability")}
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!off}
        onClose={() => setOff(null)}
        onConfirm={toggleActive}
        tone={off?.active ? "danger" : "primary"}
        title={
          off?.active ? `Deactivate ${off.name}?` : `Reactivate ${off?.name}?`
        }
        description={
          off?.active
            ? "They won't appear when assigning jobs and won't be available for inspections. Existing assignments are not removed."
            : "They'll be available for assignments again."
        }
        confirmLabel={off?.active ? "Deactivate" : "Reactivate"}
      />
    </>
  );
}
