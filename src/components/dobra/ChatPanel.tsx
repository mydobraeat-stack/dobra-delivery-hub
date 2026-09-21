import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  currentUserId,
  markThreadRead,
  messagesQuery,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat";

export function ChatPanel({ threadId }: { threadId: string }) {
  const { t, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery(messagesQuery(threadId));

  useEffect(() => {
    let active = true;
    currentUserId()
      .then((id) => active && setUserId(id))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Live updates for this conversation.
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${threadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
          queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!userId || messages.length === 0) return;
    void markThreadRead(threadId, userId);
  }, [threadId, userId, messages.length]);

  const send = useMutation({
    mutationFn: (body: string) => sendChatMessage(threadId, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => messages as ChatMessage[], [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-4">
        {isLoading ? (
          <p className="text-sm text-foreground/60">{t("common.state.loading")}</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("chat.empty")}</p>
        ) : (
          grouped.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-foreground/50")}>
                    {formatDate(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-0 flex items-end gap-2 border-t border-ink/10 bg-card/95 px-1 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) send.mutate(draft);
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (draft.trim()) send.mutate(draft);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={t("chat.placeholder")}
          aria-label={t("chat.placeholder")}
          className="max-h-32 min-h-[44px] flex-1 resize-none"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || send.isPending} aria-label={t("chat.send")}>
          <Send className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
