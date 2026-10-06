"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "./Page";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string; header: string; cell: (row: T) => React.ReactNode;
  className?: string; align?: "right";
  /** @deprecated No longer used — table is always a table */
  mobile?: "title" | "hide" | "badge";
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/** Horizontally-scrollable table on all screen sizes with pagination. */
export function DataTable<T extends { id: string }>({ columns, rows, href, loading, error, onRetry, empty }: {
  columns: Column<T>[]; rows?: T[] | null; href?: (r: T) => string; loading?: boolean; error?: string | null; onRetry?: () => void;
  empty?: { title: string; description?: string; action?: React.ReactNode };
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  if (loading && !rows) return <LoadingState rows={5} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={empty?.title ?? "Nothing here yet"} description={empty?.description} action={empty?.action} />;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handlePageSize = (val: string) => {
    setPageSize(Number(val));
    setPage(1);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs hover:bg-muted/40">
              {columns.map((c) => (
                <TableHead key={c.key} scope="col" className={cn("h-auto whitespace-nowrap px-5 py-3 text-xs text-muted-foreground", c.align === "right" && "text-right")}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((r) => (
              <TableRow key={r.id}>
                {columns.map((c, i) => (
                  <TableCell key={c.key} className={cn("px-5 py-3.5 text-foreground/80", c.align === "right" && "text-right", c.className)}>
                    {i === 0 && href
                      ? <Link href={href(r)} className="font-semibold text-primary hover:underline">{c.cell(r)}</Link>
                      : c.cell(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Rows per page</span>
          <NativeSelect value={String(pageSize)} onChange={(e) => handlePageSize(e.target.value)} className="h-8 w-16 py-0 px-2 text-xs">
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={String(s)}>{s}</option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {rows.length === 0 ? "0" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, rows.length)}`} of {rows.length}
          </span>
          <Button
            variant="outline" size="icon"
            className="h-8 w-8"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[2.5rem] text-center text-xs font-medium text-foreground">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="outline" size="icon"
            className="h-8 w-8"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
