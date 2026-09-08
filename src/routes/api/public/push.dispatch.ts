import { createFileRoute } from "@tanstack/react-router";
import { buildPushPayload } from "@block65/webcrypto-web-push";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export const Route = createFileRoute("/api/public/push/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PUSH_HOOK_SECRET"];
        if (!secret || request.headers.get("x-push-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json().catch(() => null)) as { notification_id?: string } | null;
        const notificationId = body?.notification_id;
        if (!notificationId) return new Response("Bad request", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: notification } = await supabaseAdmin
          .from("notifications")
          .select("id,user_id,title,message,link,type")
          .eq("id", notificationId)
          .maybeSingle<NotificationRow>();
        if (!notification) return new Response("Not found", { status: 404 });

        const { data: subs } = await supabaseAdmin
          .from("push_subscriptions")
          .select("id,endpoint,p256dh,auth")
          .eq("user_id", notification.user_id)
          .returns<SubscriptionRow[]>();

        if (!subs || subs.length === 0) return Response.json({ sent: 0 });

        const vapid = {
          subject: process.env["VAPID_SUBJECT"] ?? "mailto:support@dobra.app",
          publicKey: process.env["VAPID_PUBLIC_KEY"],
          privateKey: process.env["VAPID_PRIVATE_KEY"],
        };

        const payload = {
          data: {
            title: notification.title,
            body: notification.message,
            url: notification.link ?? "/home",
            tag: notification.type,
          },
          options: { ttl: 60 * 60, urgency: "high" as const },
        };

        let sent = 0;
        const stale: string[] = [];

        await Promise.all(
          subs.map(async (sub) => {
            try {
              const init = await buildPushPayload(
                payload,
                { endpoint: sub.endpoint, expirationTime: null, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                vapid,
              );
              const res = await fetch(sub.endpoint, init as RequestInit);
              if (res.status === 404 || res.status === 410) stale.push(sub.id);
              else if (res.ok) sent += 1;
              else console.warn("[push] send failed", res.status, await res.text());
            } catch (err) {
              console.warn("[push] send error", err);
            }
          }),
        );

        if (stale.length > 0) {
          await supabaseAdmin.from("push_subscriptions").delete().in("id", stale);
        }

        return Response.json({ sent, removed: stale.length });
      },
    },
  },
});
