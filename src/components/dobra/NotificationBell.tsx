import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n, useT } from "@/lib/i18n";
import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQuery,
  type AppNotification,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const t = useT();
  const { formatDate } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery(notificationsQuery);
  const items = data ?? [];
  const unread = items.filter((n) => !n.read).length;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  const row = (n: AppNotification) => (
    <li key={n.id} className={cn("border-b border-ink/5 last:border-0", !n.read && "bg-sun/10")}>
      <Link
        to={n.link ?? "/home"}
        onClick={() => {
          if (!n.read) readOne.mutate(n.id);
          setOpen(false);
        }}
        className="block px-4 py-3 hover:bg-muted/60"
      >
        <p className="text-sm font-semibold text-foreground">{n.title}</p>
        <p className="mt-0.5 text-xs text-foreground/70">{n.message}</p>
        <p className="mt-1 text-[11px] text-foreground/50">
          {formatDate(n.created_at, { dateStyle: "short", timeStyle: "short" })}
        </p>
      </Link>
    </li>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label={t("common.notifications.title")}>
          <Bell className="size-4" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-4 py-2">
          <span className="text-sm font-semibold">{t("common.notifications.title")}</span>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => readAll.mutate()}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("common.notifications.markAll")}
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-foreground/60">{t("common.notifications.empty")}</p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul>{items.map(row)}</ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
