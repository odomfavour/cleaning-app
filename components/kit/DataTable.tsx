"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "./Page";

export interface Column<T> {
  key: string; header: string; cell: (row: T) => React.ReactNode;
  className?: string; align?: "right";
  /** Mobile card: "title" is shown prominently, "hide" is omitted, default is a label/value line. */
  mobile?: "title" | "hide" | "badge";
}

/** Table on md+, stacked cards on mobile (not a squeezed table). */
export function DataTable<T extends { id: string }>({ columns, rows, href, loading, error, onRetry, empty }: {
  columns: Column<T>[]; rows?: T[] | null; href?: (r: T) => string; loading?: boolean; error?: string | null; onRetry?: () => void;
  empty?: { title: string; description?: string; action?: React.ReactNode };
}) {
  if (loading && !rows) return <LoadingState rows={5} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={empty?.title ?? "Nothing here yet"} description={empty?.description} action={empty?.action} />;
  const title = columns.find((c) => c.mobile === "title") ?? columns[0];
  const badge = columns.find((c) => c.mobile === "badge");
  const rest = columns.filter((c) => c !== title && c !== badge && c.mobile !== "hide");
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs hover:bg-muted/40">
              {columns.map((c) => <TableHead key={c.key} scope="col" className={cn("h-auto px-5 py-3 text-xs text-muted-foreground", c.align === "right" && "text-right")}>{c.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                {columns.map((c, i) => (
                  <TableCell key={c.key} className={cn("px-5 py-3.5 whitespace-normal text-foreground/80", c.align === "right" && "text-right", c.className)}>
                    {i === 0 && href ? <Link href={href(r)} className="font-semibold text-primary hover:underline">{c.cell(r)}</Link> : c.cell(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y divide-border md:hidden">
        {rows.map((r) => {
          const inner = (
            <div className="space-y-2.5 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 font-semibold text-primary">{href ? <Link href={href(r)} className="hover:underline">{title.cell(r)}</Link> : title.cell(r)}</div>
                {badge && <div className="shrink-0">{badge.cell(r)}</div>}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {rest.map((c) => (
                  <div key={c.key} className={cn("min-w-0", c.key === "action" && "col-span-2")}>
                    {c.key !== "action" && <dt className="text-xs text-muted-foreground">{c.header}</dt>}
                    <dd className="text-foreground">{c.cell(r)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
          return <li key={r.id}>{inner}</li>;
        })}
      </ul>
    </>
  );
}
