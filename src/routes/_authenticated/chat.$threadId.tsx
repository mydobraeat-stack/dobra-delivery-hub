import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/dobra/AppHeader";
import { ChatPanel } from "@/components/dobra/ChatPanel";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import { Button } from "@/components/ui/button";
import { accountQueryOptions } from "@/lib/profile";
import { currentUserId, fetchDisplayNames, threadQuery } from "@/lib/chat";
import { orderRef } from "@/lib/dobra";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — Dobra" },
      { name: "description", content: "Message your driver, the restaurant or Dobra support in real time." },
      { property: "og:title", content: "Chat — Dobra" },
      {
        property: "og:description",
        content: "Message your driver, the restaurant or Dobra support in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatScreen,
});

function ChatScreen() {
  const { threadId } = Route.useParams();
  const router = useRouter();
  const t = useT();
  const { data: thread, isLoading } = useQuery(threadQuery(threadId));
  const { data: account } = useQuery(accountQueryOptions);
  const [otherName, setOtherName] = useState<string>("");

  useEffect(() => {
    if (!thread) return;
    let active = true;
    void (async () => {
      const me = await currentUserId().catch(() => null);
      const otherId = me === thread.customer_id ? thread.counterpart_id : thread.customer_id;
      if (!otherId) return;
      const names = await fetchDisplayNames([otherId]);
      if (active) setOtherName(names[otherId] ?? "");
    })();
    return () => {
      active = false;
    };
  }, [thread]);

  const title = !thread
    ? t("chat.title")
    : thread.kind === "support"
      ? t("chat.supportTitle")
      : thread.kind === "order_driver"
        ? t("chat.driverTitle")
        : t("chat.vendorTitle");

  const subtitle = thread?.order_id
    ? orderRef(thread.order_id)
    : otherName || t("chat.supportSubtitle");

  const body = (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 pb-4">
      <div className="flex items-center gap-2 py-3">
        <Button
          size="icon"
          variant="ghost"
          aria-label={t("common.actions.back")}
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {title}
            {otherName && thread?.kind !== "support" ? ` · ${otherName}` : ""}
          </p>
          <p className="truncate text-xs text-foreground/60">{subtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-foreground/60">{t("common.state.loading")}</p>
      ) : !thread ? (
        <p className="text-sm text-foreground/60">{t("chat.notFound")}</p>
      ) : (
        <ChatPanel threadId={threadId} />
      )}
    </div>
  );

  const wide = account?.role === "vendor" || account?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle={t("chat.title")} />
      {wide ? body : <PhoneFrame className="min-h-screen">{body}</PhoneFrame>}
    </div>
  );
}
