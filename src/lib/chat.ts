import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChatKind = "order_driver" | "order_vendor" | "support";

export type ChatThread = {
  id: string;
  kind: ChatKind;
  order_id: string | null;
  customer_id: string;
  counterpart_id: string | null;
  last_message_at: string;
};

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

const THREAD_COLS = "id,kind,order_id,customer_id,counterpart_id,last_message_at";
const MESSAGE_COLS = "id,thread_id,sender_id,body,read_at,created_at";

export async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

/** Creates (or finds) the thread for this conversation and returns its id. */
export async function openChatThread(kind: ChatKind, orderId?: string | null) {
  const { data, error } = await supabase.rpc("open_chat_thread", {
    _kind: kind,
    _order_id: orderId ?? null,
  });
  if (error) throw error;
  return data as string;
}

export const threadQuery = (threadId: string) =>
  queryOptions({
    queryKey: ["chat-thread", threadId],
    queryFn: async (): Promise<ChatThread | null> => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select(THREAD_COLS)
        .eq("id", threadId)
        .maybeSingle();
      if (error) throw error;
      return (data as ChatThread) ?? null;
    },
  });

export const messagesQuery = (threadId: string) =>
  queryOptions({
    queryKey: ["chat-messages", threadId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(MESSAGE_COLS)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });

/** All threads the signed-in user takes part in, newest activity first. */
export const myThreadsQuery = queryOptions({
  queryKey: ["chat-threads"],
  queryFn: async (): Promise<ChatThread[]> => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select(THREAD_COLS)
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ChatThread[];
  },
});

/** Support threads, for the admin inbox. */
export const supportThreadsQuery = queryOptions({
  queryKey: ["chat-threads", "support"],
  queryFn: async (): Promise<ChatThread[]> => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select(THREAD_COLS)
      .eq("kind", "support")
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ChatThread[];
  },
});

export async function sendChatMessage(threadId: string, body: string) {
  const senderId = await currentUserId();
  const text = body.trim();
  if (!text) return;
  const { error } = await supabase
    .from("chat_messages")
    .insert({ thread_id: threadId, sender_id: senderId, body: text.slice(0, 2000) });
  if (error) throw error;
}

export async function markThreadRead(threadId: string, userId: string) {
  await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .is("read_at", null)
    .neq("sender_id", userId);
}

export async function fetchDisplayNames(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {} as Record<string, string>;
  const { data } = await supabase.from("profiles").select("id, full_name").in("id", unique);
  return Object.fromEntries(
    (data ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name ?? ""]),
  ) as Record<string, string>;
}
