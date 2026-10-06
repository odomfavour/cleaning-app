"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/lib/api/services/notification.service";
import { useApi } from "@/lib/hooks";
import type { Role } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";
import { EmptyState, LoadingState } from "@/components/kit/Page";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function NotificationPanel({ audience }: { audience: Role }) {
  const [open, setOpen] = useState(false);
  const { data, loading, reload } = useApi(() => getNotifications(audience), [audience]);
  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-background bg-red-500" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[calc(100vw-1.5rem)] overflow-hidden p-0 sm:w-96">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unread > 0 && (
            <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-xs" onClick={async () => { await markAllNotificationsRead(audience); reload(); }}>
              <CheckCheck className="size-3.5" />Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-[60dvh] overflow-y-auto">
          {loading && !data ? <LoadingState rows={3} /> : !data?.length ? <EmptyState icon={Bell} title="You're all caught up" description="Updates about your requests and bookings will show up here." /> : (
            <ul className="divide-y">
              {data.map((n) => (
                <li key={n.id}>
                  <Link href={n.href ?? "#"} onClick={() => setOpen(false)} className={cn("flex gap-3 px-4 py-3 hover:bg-accent", !n.read && "bg-blue-50/50")}>
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-blue-600")} />
                    <span className="min-w-0"><span className="block text-sm font-medium">{n.title}</span><span className="block text-sm text-muted-foreground">{n.body}</span><span className="mt-0.5 block text-xs text-muted-foreground/70">{fmtDate(n.time)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
