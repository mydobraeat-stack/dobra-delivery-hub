import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CircleHelp,
  ClipboardList,
  HelpCircle,
  Languages,
  LogOut,
  Receipt,
  ShieldCheck,
  Store,
  Tag,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InitialsAvatar, ProfileMenuItem, ProfileMenuList } from "@/components/dobra/ProfileMenu";
import { ChatButton } from "@/components/dobra/ChatButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { myProfileQuery } from "@/lib/my-profile";

export const Route = createFileRoute("/_authenticated/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — Dobra" },
      { name: "description", content: "Your Dobra profile, orders, language and notifications." },
      { property: "og:title", content: "Profile — Dobra" },
      {
        property: "og:description",
        content: "Your Dobra profile, orders, language and notifications.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileHub,
});

function ProfileHub() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: profile } = useQuery(myProfileQuery);
  const role = account?.role ?? "customer";

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const ordersTo =
    role === "vendor" ? "/vendor" : role === "driver" ? "/driver/deliveries" : "/customer/orders";
  const helpTo = role === "driver" ? "/driver/help" : "/help";

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <div className="flex items-center gap-4">
        <InitialsAvatar
          name={profile?.full_name}
          email={profile?.email}
          src={profile?.avatar_url ?? null}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">
            {profile?.full_name?.trim() || profile?.email || "—"}
          </p>
          <p className="truncate text-sm text-foreground/60">{profile?.email}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {t(`common.roles.${role}`)}
        </Badge>
      </div>

      <h1 className="text-2xl font-bold text-foreground">{t("common.actions.profile")}</h1>

      <ProfileMenuList>
        <ProfileMenuItem to={ordersTo} icon={Receipt} label={t("common.profileMenu.orders")} />
        <ProfileMenuItem to="/profile/account" icon={User} label={t("common.profileMenu.account")} />
        {role === "customer" ? (
          <ProfileMenuItem to="/profile/promos" icon={Tag} label={t("common.profileMenu.promos")} />
        ) : null}
        <ProfileMenuItem
          to="/profile/language"
          icon={Languages}
          label={t("common.profileMenu.language")}
        />
        <ProfileMenuItem to={helpTo} icon={CircleHelp} label={t("common.profileMenu.faq")} />
        <ProfileMenuItem
          to="/profile/notifications"
          icon={Bell}
          label={t("common.profileMenu.notifications")}
        />
        {role === "driver" ? (
          <ProfileMenuItem
            to="/driver/documents"
            icon={ShieldCheck}
            label={t("common.profileMenu.verification")}
          />
        ) : null}
        {role === "vendor" ? (
          <ProfileMenuItem
            to="/vendor/store"
            icon={Store}
            label={t("common.profileMenu.business")}
          />
        ) : null}
        {role === "admin" ? (
          <ProfileMenuItem
            to="/admin"
            icon={ClipboardList}
            label={t("common.profileMenu.business")}
          />
        ) : null}
      </ProfileMenuList>

      {role === "admin" ? null : (
        <ChatButton
          kind="support"
          variant="outline"
          size="default"
          className="w-full"
          label={t("chat.contactSupport")}
        />
      )}

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="size-4" aria-hidden />
        {t("common.actions.signOut")}
      </Button>
      <HelpCircle className="hidden" aria-hidden />
    </main>
  );
}
