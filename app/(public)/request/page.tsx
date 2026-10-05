"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { Card, CardBody } from "@/components/kit/Card";
import { Input } from "@/components/kit/Field";

const schema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^REQ-/, "Enter a valid request reference starting with REQ-"),
});

export default function TrackLookupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-primary">
          <Search className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-bold text-primary">Track your request</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the reference we gave you when you submitted your request.
        </p>
      </div>
      <Card>
        <CardBody className="p-6">
          <form
            onSubmit={handleSubmit((v) =>
              router.push(`/request/${v.reference.toUpperCase()}`),
            )}
            noValidate
            className="space-y-4"
          >
            <Input
              label="Request reference"
              placeholder="REQ-1029"
              autoCapitalize="characters"
              error={errors.reference?.message}
              {...register("reference")}
            />
            <Button type="submit" size="lg" full>
              Track request
            </Button>
          </form>
        </CardBody>
      </Card>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Can&apos;t find your reference? Check the email or SMS we sent you, or{" "}
        <a
          href="tel:+2348035550142"
          className="font-medium text-blue-700 hover:underline"
        >
          call us
        </a>
        .
      </p>
    </div>
  );
}
