"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Avatar } from "@/components/kit/Misc";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { ErrorState, PageHeader, PageSkeleton } from "@/components/kit/Page";
import { Input } from "@/components/kit/Field";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getCustomerProfile,
  updateCustomerPassword,
  updateCustomerProfile,
} from "@/lib/api/services/customer-profile.service";
import { fmtDate } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s]{10,16}$/, "Enter a valid phone number"),
});
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
const profileKey = ["customer-profile"] as const;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: profileKey,
    queryFn: getCustomerProfile,
  });
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(profileKey, profile);
      await queryClient.invalidateQueries({
        queryKey: ["auth", "current-user"],
      });
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const passwordMutation = useMutation({
    mutationFn: updateCustomerPassword,
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Password updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    form.reset({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      phone: profileQuery.data.phone,
    });
  }, [profileQuery.data, form]);

  if (profileQuery.isLoading) return <PageSkeleton />;
  if (profileQuery.error || !profileQuery.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(profileQuery.error)}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account and contact details."
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <Avatar name={profile.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-foreground">
                {profile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Customer since{" "}
                {fmtDate(profile.createdAt, { month: "long", year: "numeric" })}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Personal information" />
          <form
            onSubmit={form.handleSubmit((values) =>
              updateMutation.mutate(values),
            )}
          >
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  autoComplete="given-name"
                  error={form.formState.errors.firstName?.message}
                  {...form.register("firstName")}
                />
                <Input
                  label="Last name"
                  autoComplete="family-name"
                  error={form.formState.errors.lastName?.message}
                  {...form.register("lastName")}
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={profile.email}
                readOnly
                hint="Contact support to change the email used to sign in."
              />
              <Input
                label="Phone"
                type="tel"
                autoComplete="tel"
                error={form.formState.errors.phone?.message}
                {...form.register("phone")}
              />
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={!form.formState.isDirty}
              >
                Save changes
              </Button>
            </CardBody>
          </form>
        </Card>

        <Card>
          <CardHeader title="Password and security" />
          <form
            onSubmit={passwordForm.handleSubmit(
              ({ currentPassword, newPassword }) =>
                passwordMutation.mutate({ currentPassword, newPassword }),
            )}
          >
            <CardBody className="space-y-4">
              <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters, with an uppercase letter and a number."
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
              <Button
                type="submit"
                loading={passwordMutation.isPending}
                disabled={!passwordForm.formState.isDirty}
              >
                Update password
              </Button>
            </CardBody>
          </form>
        </Card>
      </div>
    </>
  );
}
