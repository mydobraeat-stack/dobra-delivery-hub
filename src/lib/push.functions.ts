import { createServerFn } from "@tanstack/react-start";

/** Public VAPID key used by the browser to create a push subscription. */
export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { key: process.env["VAPID_PUBLIC_KEY"] ?? null };
});
