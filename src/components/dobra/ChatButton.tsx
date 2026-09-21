import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openChatThread, type ChatKind } from "@/lib/chat";
import { useT } from "@/lib/i18n";

type Props = {
  kind: ChatKind;
  orderId?: string | null;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
};

/** Opens (or creates) the right conversation and goes to the chat screen. */
export function ChatButton({ kind, orderId, label, size = "sm", variant = "outline", className }: Props) {
  const navigate = useNavigate();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      const threadId = await openChatThread(kind, orderId ?? null);
      await navigate({ to: "/chat/$threadId", params: { threadId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" size={size} variant={variant} disabled={busy} onClick={go} className={className}>
      <MessageCircle className="size-4" aria-hidden />
      <span className="truncate">{label ?? t("chat.message")}</span>
    </Button>
  );
}
