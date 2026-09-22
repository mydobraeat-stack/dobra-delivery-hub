import { createFileRoute } from "@tanstack/react-router";
import { PushSettings } from "@/components/dobra/PushSettings";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile/notifications")({
  head: () => ({
    meta: [
      { title: "Notification settings — Dobra" },
      { name: "description", content: "Choose how Dobra alerts you about orders and messages." },
      { property: "og:title", content: "Notification settings — Dobra" },
      {
        property: "og:description",
        content: "Choose how Dobra alerts you about orders and messages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileNotifications,
});

function ProfileNotifications() {
  const t = useT();
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("common.profileMenu.notifications")}
      </h1>
      <PushSettings />
    </main>
  );
}
