import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useImageUrl } from "@/lib/storage";
import {
  currentUserId,
  markThreadRead,
  messagesQuery,
  sendChatMessage,
  uploadChatFile,
  type ChatAttachment,
  type ChatMessage,
} from "@/lib/chat";

const MAX_BYTES = 10 * 1024 * 1024;

/** Renders an image or a file link for a chat attachment. */
function Attachment({ message }: { message: ChatMessage }) {
  const { t } = useI18n();
  const url = useImageUrl(message.attachment_url);
  const isImage = (message.attachment_type ?? "").startsWith("image/");

  if (!message.attachment_url) return null;

  if (isImage) {
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="mt-1 block">
        <img
          src={url}
          alt={message.attachment_name ?? ""}
          className="max-h-56 w-full rounded-xl object-cover object-center"
        />
      </a>
    ) : (
      <div className="mt-1 h-32 w-40 animate-pulse rounded-xl bg-foreground/10" aria-hidden />
    );
  }

  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="mt-1 flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-xs font-medium text-foreground underline-offset-2 hover:underline"
    >
      <FileText className="size-4 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 break-words">{message.attachment_name ?? t("chat.attachOpen")}</span>
    </a>
  );
}

export function ChatPanel({ threadId }: { threadId: string }) {
  const { t, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
    mutationFn: async ({ body, upload }: { body: string; upload: File | null }) => {
      let attachment: ChatAttachment | null = null;
      if (upload) attachment = await uploadChatFile(upload);
      await sendChatMessage(threadId, body, attachment);
    },
    onSuccess: () => {
      setDraft("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => messages as ChatMessage[], [messages]);
  const canSend = (draft.trim().length > 0 || file !== null) && !send.isPending;

  function submit() {
    if (!canSend) return;
    send.mutate({ body: draft, upload: file });
  }

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
                  {m.body.trim() ? (
                    <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  ) : null}
                  <Attachment message={m} />
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-primary-foreground/70" : "text-foreground/50",
                    )}
                  >
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
        className="sticky bottom-0 space-y-2 border-t border-ink/10 bg-card/95 px-1 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {file ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Paperclip className="size-4 shrink-0 text-brand" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {file.name}
            </span>
            <button
              type="button"
              aria-label={t("chat.attachRemove")}
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="shrink-0 rounded-full p-1 text-foreground/60 hover:bg-background hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > MAX_BYTES) {
                toast.error(t("chat.attachTooBig"));
                e.target.value = "";
                return;
              }
              setFile(f);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0 border-2 border-brand/30 text-brand hover:bg-brand/10 hover:text-brand"
            aria-label={t("chat.attach")}
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="size-4" aria-hidden />
          </Button>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.placeholder")}
            className="max-h-32 min-h-[44px] flex-1 resize-none"
          />
          <Button type="submit" size="icon" disabled={!canSend} aria-label={t("chat.send")}>
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
        {send.isPending ? (
          <p className="text-[11px] text-foreground/60">{t("chat.attachUploading")}</p>
        ) : null}
      </form>
    </div>
  );
}
