import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchDisplayNames, supportThreadsQuery } from "@/lib/chat";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/support")({
  head: () => ({
    meta: [
      { title: "Support inbox — Dobra Admin" },
      { name: "description", content: "Answer customer, vendor and driver support conversations." },
      { property: "og:title", content: "Support inbox — Dobra Admin" },
      {
        property: "og:description",
        content: "Answer customer, vendor and driver support conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSupport,
});

function AdminSupport() {
  const { t, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const { data: threads = [], isLoading } = useQuery(supportThreadsQuery);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const channel = supabase
      .channel("admin-support")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (threads.length === 0) return;
    let active = true;
    void fetchDisplayNames(threads.map((th) => th.customer_id)).then((map) => {
      if (active) setNames(map);
    });
    return () => {
      active = false;
    };
  }, [threads]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{t("chat.inboxTitle")}</h1>

      {isLoading ? (
        <p className="text-sm text-foreground/60">{t("common.state.loading")}</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-foreground/60">{t("chat.inboxEmpty")}</p>
      ) : (
        <div className="space-y-3">
          {threads.map((th) => (
            <Card key={th.id} className="border-ink/10">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {names[th.customer_id] || t("chat.supportTitle")}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {t("chat.lastActivity", { time: formatDate(th.last_message_at) })}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to="/chat/$threadId" params={{ threadId: th.id }}>
                    <MessageCircle className="size-4" aria-hidden /> {t("chat.open")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
