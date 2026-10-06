"use client";
import { useState } from "react";
import { Info, Pencil, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Switch } from "@/components/kit/Misc";
import { Dialog } from "@/components/kit/Dialog";
import { Input, Textarea } from "@/components/kit/Field";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { Badge } from "@/components/kit/Badge";
import type { Service } from "@/lib/types";
import {
  useCreateService,
  useServices,
  useUpdateService,
} from "@/lib/hooks/queries/use-services";

const schema = z.object({
  name: z.string().min(2, "Enter a service name"),
  description: z.string().min(10, "Add a short description for customers"),
  guidance: z
    .string()
    .min(3, "Add pricing guidance, e.g. 'Quoted by number of rooms'"),
  duration: z.string().min(2, "Enter an estimated duration"),
});
type V = z.infer<typeof schema>;

export default function ServicesPage() {
  const { data = [], isLoading, isError, refetch } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const [edit, setEdit] = useState<Service | "new" | null>(null);
  const f = useForm<V>({ resolver: zodResolver(schema) });
  const open = (s: Service | "new") => {
    setEdit(s);
    f.reset(
      s === "new"
        ? { name: "", description: "", guidance: "", duration: "" }
        : s,
    );
  };
  const save = f.handleSubmit(async (v) => {
    if (edit === "new") {
      await createMutation.mutateAsync({
        ...v,
        active: true,
      });
    } else if (edit) {
      await updateMutation.mutateAsync({
        id: edit.id,
        patch: v,
      });
    }
    toast.success("Service saved");
    setEdit(null);
    refetch();
  });
  const e = f.formState.errors;
  const columns: Column<Service>[] = [
    { key: "name", header: "Service", cell: (s) => s.name, mobile: "title" },
    {
      key: "desc",
      header: "Description",
      cell: (s) => (
        <span className="line-clamp-2 max-w-md">{s.description}</span>
      ),
      mobile: "hide",
    },
    {
      key: "guide",
      header: "Pricing guidance",
      cell: (s) => <Badge tone="neutral">{s.guidance}</Badge>,
    },
    { key: "dur", header: "Est. duration", cell: (s) => s.duration },
    {
      key: "active",
      header: "Active",
      cell: (s) => (
        <Switch
          label={`${s.name} active`}
          checked={s.active}
          onChange={async (v) => {
            await updateMutation.mutateAsync({
              id: s.id,
              patch: { active: v },
            });
            toast.success(
              v ? "Service is now bookable" : "Service hidden from customers",
            );
            refetch();
          }}
        />
      ),
    },
    {
      key: "action",
      header: "Edit",
      align: "right",
      cell: (s) => (
        <Button size="sm" variant="secondary" onClick={() => open(s)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        title="Services"
        description="What customers can choose when they request a cleaning."
        actions={
          <Button onClick={() => open("new")}>
            <Plus className="h-4 w-4" />
            Add service
          </Button>
        }
      />
      <div className="mb-5 flex gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Services don&apos;t have fixed prices. Final amounts are set per job
          in the quotation. Pricing guidance is an internal note to help whoever
          prepares the quote.
        </p>
      </div>
      <Card>
        <DataTable
          columns={columns}
          rows={data}
          loading={isLoading}
          error={isError ? "Couldn't load services." : null}
          onRetry={() => refetch()}
        />
      </Card>
      <Dialog
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit === "new" ? "Add service" : "Edit service"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button onClick={save} loading={f.formState.isSubmitting}>
              Save service
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Service name"
            error={e.name?.message}
            {...f.register("name")}
          />
          <Textarea
            label="Description"
            rows={3}
            error={e.description?.message}
            {...f.register("description")}
          />
          <Input
            label="Pricing guidance (internal)"
            placeholder="Quoted by number of rooms"
            error={e.guidance?.message}
            {...f.register("guidance")}
          />
          <Input
            label="Estimated duration"
            placeholder="2–4 hrs"
            error={e.duration?.message}
            {...f.register("duration")}
          />
        </div>
      </Dialog>
    </>
  );
}
