import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getVapidPublicKey } from "@/lib/push.functions";

const ASKED_KEY = "dobra.push.asked";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function keyToBase64(key: ArrayBuffer | null) {
  if (!key) return "";
  const bytes = new Uint8Array(key);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Registers the service worker, subscribes and stores the subscription. */
export async function enablePush(): Promise<"granted" | "denied" | "unsupported" | "error"> {
  if (!pushSupported()) return "unsupported";
  try {
    const permission =
      Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") return "denied";

    const { key } = await getVapidPublicKey();
    if (!key) return "error";

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      }));

    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return "error";

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: keyToBase64(subscription.getKey("p256dh")),
        auth: keyToBase64(subscription.getKey("auth")),
        user_agent: navigator.userAgent.slice(0, 300),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    if (error) throw error;
    return "granted";
  } catch (err) {
    console.warn("[push] could not enable", err);
    return "error";
  }
}

/**
 * Asks for notification permission once per browser, shortly after the user
 * lands in the app. Silently does nothing when unsupported or already denied.
 */
export function usePushRegistration() {
  useEffect(() => {
    if (!pushSupported()) return;

    // Already granted: refresh the stored subscription (it can rotate).
    if (Notification.permission === "granted") {
      void enablePush();
      return;
    }
    if (Notification.permission === "denied") return;
    if (localStorage.getItem(ASKED_KEY)) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(ASKED_KEY, "1");
      void enablePush();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);
}
