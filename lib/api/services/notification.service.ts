import { apiClient } from "@/lib/api/client";
import type { Role } from "@/lib/types";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
};

export async function getNotifications(
  audience?: Role,
): Promise<AppNotification[]> {
  const response = await apiClient.get<{ notifications: AppNotification[] }>(
    "/notifications",
    {
      params: audience ? { audience } : undefined,
    },
  );

  return response.data.notifications;
}

export async function markAllNotificationsRead(
  audience?: Role,
): Promise<void> {
  await apiClient.post("/notifications/read-all", { audience });
}
