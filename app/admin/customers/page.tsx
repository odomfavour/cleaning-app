"use client";
import { useMemo, useState } from "react";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader } from "@/components/kit/Page";
import { SearchInput } from "@/components/kit/Field";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { Badge, StatusBadge } from "@/components/kit/Badge";
import { Avatar } from "@/components/kit/Misc";
import { generic } from "@/lib/status";
import type { Customer } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

export default function CustomersPage() {
  const { d, loading, error, reload } = useAdminData();
  const [q, setQ] = useState("");
  const rows = useMemo(() => d?.customers.filter((c) => !q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())), [d, q]);
  const mine = (c: Customer) => d?.bookings.filter((b) => b.customerId === c.id) ?? [];
  const columns: Column<Customer>[] = [
    { key: "name", header: "Customer", cell: (c) => <span className="inline-flex items-center gap-2.5"><Avatar name={c.name} size="sm" className="hidden md:inline-flex" />{c.name}</span>, mobile: "title" },
    { key: "phone", header: "Phone", cell: (c) => c.phone },
    { key: "email", header: "Email", cell: (c) => <span className="break-all">{c.email}</span> },
    { key: "n", header: "Bookings", cell: (c) => mine(c).length },
    { key: "last", header: "Last booking", cell: (c) => { const l = [...mine(c)].sort((a, b) => b.date.localeCompare(a.date))[0]; return l ? fmtDate(l.date) : "—"; } },
    { key: "status", header: "Status", cell: (c) => <span className="inline-flex flex-wrap gap-1.5"><StatusBadge status={c.status} map={generic} />{!c.hasAccount && <Badge tone="purple">Guest</Badge>}</span>, mobile: "badge" },
    { key: "action", header: "Action", align: "right", cell: (c) => <Button size="sm" variant="secondary" href={`/admin/customers/${c.id}`}>View</Button> },
  ];
  return (
    <>
      <PageHeader title="Customers" description="Everyone who has requested a cleaning." />
      <Card>
        <div className="border-b p-4"><SearchInput label="Search customers" className="sm:w-72" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" /></div>
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={reload} href={(c) => `/admin/customers/${c.id}`} empty={{ title: "No customers found", description: "Try a different search." }} />
      </Card>
    </>
  );
}
