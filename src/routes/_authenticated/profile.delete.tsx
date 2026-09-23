import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMyAccount } from "@/lib/account.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile/delete")({
  head: () => ({
    meta: [
      { title: "Delete your account — Dobra" },
      { name: "description", content: "Permanently delete your Dobra account and personal data." },
      { property: "og:title", content: "Delete your account — Dobra" },
      {
        property: "og:description",
        content: "Permanently delete your Dobra account and personal data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const ready = text.trim().toUpperCase() === "DELETE";

  async function remove() {
    if (!ready) return;
    setBusy(true);
    try {
      await deleteMyAccount({ data: { confirm: "DELETE" } });
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success(t("common.deleteAccount.done"));
      navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.deleteAccount.failed"));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("common.deleteAccount.pageTitle")}</h1>

      <Card className="border-destructive/30">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm leading-relaxed font-medium text-foreground">
              {t("common.deleteAccount.warning")}
            </p>
          </div>
          <ul className="list-disc space-y-1.5 pl-9 text-sm text-foreground/75">
            <li>{t("common.deleteAccount.point1")}</li>
            <li>{t("common.deleteAccount.point2")}</li>
            <li>{t("common.deleteAccount.point3")}</li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="confirm-delete">{t("common.deleteAccount.typePrompt")}</Label>
        <Input
          id="confirm-delete"
          value={text}
          autoComplete="off"
          onChange={(e) => setText(e.target.value)}
          placeholder="DELETE"
        />
      </div>

      <Button
        onClick={remove}
        disabled={!ready || busy}
        className="h-12 w-full rounded-2xl bg-destructive text-base font-semibold text-destructive-foreground hover:bg-destructive/90"
      >
        {busy ? t("common.deleteAccount.deleting") : t("common.deleteAccount.confirm")}
      </Button>
    </main>
  );
}
