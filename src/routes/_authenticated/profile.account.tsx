import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMyAccount } from "@/lib/account.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/dobra/ImageUpload";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { useT, useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { myProfileQuery } from "@/lib/my-profile";
import { myOrdersQuery, myDriverQuery, vendorRestaurantsQuery } from "@/lib/dobra";
import { requiredDocsFor, driverDocsQuery } from "@/lib/driver-docs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile/account")({
  head: () => ({
    meta: [
      { title: "Account — Dobra" },
      { name: "description", content: "Manage your Dobra account details, photo and password." },
      { property: "og:title", content: "Account — Dobra" },
      {
        property: "og:description",
        content: "Manage your Dobra account details, photo and password.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const queryClient = useQueryClient();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: profile } = useQuery(myProfileQuery);
  const t = useT();
  const role = account?.role ?? "customer";

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  async function removeAccount() {
    setDeleting(true);
    try {
      await deleteMyAccount();
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success(t("common.deleteAccount.done"));
      navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.deleteAccount.failed"));
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setCountry(profile.country ?? "");
    setPhone(profile.phone ?? "");
    setAvatar(profile.avatar_url ?? null);
  }, [profile]);

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          country: country.trim() || null,
          phone: phone.trim() || null,
          avatar_url: avatar,
        })
        .eq("id", profile!.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success(t("common.profile.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordReset() {
    const email = profile?.email;
    if (!email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success(t("common.profileMenu.passwordSent"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.profileMenu.passwordFailed"));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <ProfileBackLink label={t("common.actions.back")} />
        </div>
        <h1 className="text-lg font-bold text-foreground">{t("common.profileMenu.account")}</h1>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
        <EditRow
          icon={ImageIcon}
          label={t("common.profile.photo")}
          title={t("common.profile.photo")}
          onSave={save}
          saving={saving}
          preview={
            <InitialsAvatar
              name={fullName}
              email={profile?.email}
              src={avatar}
              className="size-9 border"
            />
          }
        >
          <ImageUpload
            bucket="profile-photos"
            value={avatar}
            onChange={setAvatar}
            label={t("common.profile.photo")}
          />
        </EditRow>

        <EditRow
          icon={User}
          label={fullName || t("common.profile.namePlaceholder")}
          title={t("common.profileMenu.editName")}
          onSave={save}
          saving={saving}
          strong
        >
          <div className="space-y-2">
            <Label htmlFor="full-name">{t("common.profile.fullName")}</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("common.profile.namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t("common.profile.country")}</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={t("common.profile.countryPlaceholder")}
            />
          </div>
        </EditRow>

        <Row icon={Mail} label={profile?.email ?? t("common.profile.email")} strong muted />

        <ActionRow
          icon={Lock}
          label={t("common.profileMenu.changePassword")}
          onClick={sendPasswordReset}
          disabled={sendingReset}
        />

        <EditRow
          icon={Smartphone}
          label={t("common.profileMenu.changePhone")}
          title={t("common.profileMenu.editPhone")}
          onSave={save}
          saving={saving}
        >
          <div className="space-y-2">
            <Label htmlFor="phone">{t("common.profile.phone")}</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+48 600 000 000"
            />
          </div>
        </EditRow>

        <ActionRow
          icon={CreditCard}
          label={t("common.profileMenu.payments")}
          onClick={() => toast.info(t("common.profileMenu.soon"))}
        />
        <ActionRow
          icon={FileText}
          label={t("common.profileMenu.invoice")}
          onClick={() => toast.info(t("common.profileMenu.soon"))}
        />
        <LinkRow icon={Megaphone} label={t("common.profileMenu.managePrivacy")} to="/privacy" />
      </ul>

      <div className="flex items-center justify-between gap-3 px-1">
        <Badge variant="secondary">{t(`common.roles.${role}`)}</Badge>
        <div>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={deleting}
                  className="text-xs font-medium text-foreground/40 underline underline-offset-4 transition-colors hover:text-destructive"
                >
                  {deleting ? t("common.deleteAccount.deleting") : t("common.deleteAccount.link")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[20rem] rounded-2xl border-ink/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold text-foreground">
                    {t("common.deleteAccount.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-foreground/70">
                    {t("common.deleteAccount.body")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel className="h-11 rounded-xl border-2 border-ink/15 bg-card text-base font-semibold text-foreground hover:bg-muted">
                    {t("common.actions.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={removeAccount}
                    className="h-11 rounded-xl bg-destructive text-base font-semibold text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("common.deleteAccount.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>


      {role === "customer" ? <CustomerSection /> : null}
      {role === "vendor" ? <VendorSection status={profile?.approval_status ?? null} /> : null}
      {role === "driver" ? <DriverSection status={profile?.approval_status ?? null} /> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-ink/10 bg-muted/50 px-4 py-3">
      <div className="text-xs break-words text-foreground/60">{label}</div>
      <div className="text-lg font-semibold break-words text-foreground">{value}</div>
    </div>
  );
}

function CustomerSection() {
  const { data: orders } = useQuery(myOrdersQuery);
  const t = useT();
  const { formatMoney } = useI18n();
  const list = orders ?? [];
  const spent = list
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">{t("common.profile.ordering")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t("common.profile.ordersPlaced")} value={String(list.length)} />
          <Stat
            label={t("common.profile.totalSpent")}
            value={formatMoney(spent, list[0]?.currency ?? "EUR")}
          />
        </div>
        <Button asChild variant="outline">
          <Link to="/customer">{t("common.profile.browse")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function VendorSection({ status }: { status: string | null | undefined }) {
  const { data: restaurants } = useQuery(vendorRestaurantsQuery);
  const t = useT();
  const list = restaurants ?? [];

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">{t("common.profile.business")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t("common.profile.restaurants")} value={String(list.length)} />
          <Stat
            label={t("common.profile.accountStatus")}
            value={status === "approved" ? t("common.approval.approved") : t("common.approval.pending")}
          />
        </div>
        {list.length ? (
          <ul className="space-y-1 text-sm text-foreground/70">
            {list.map((r) => (
              <li key={r.id}>
                {r.name} — {r.city ?? "—"} ({r.status})
              </li>
            ))}
          </ul>
        ) : null}
        <Button asChild variant="outline">
          <Link to="/vendor">{t("common.profile.openDashboard")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DriverSection({ status }: { status: string | null | undefined }) {
  const queryClient = useQueryClient();
  const { data: driver } = useQuery(myDriverQuery);
  const t = useT();
  const [vehicle, setVehicle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVehicle(driver?.vehicle_type ?? "");
  }, [driver]);

  async function saveVehicle() {
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) throw new Error("Not signed in");
      const { error } = await supabase
        .from("drivers")
        .upsert({ id, vehicle_type: vehicle.trim() || null }, { onConflict: "id" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
      toast.success(t("common.profile.vehicleSaved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.profile.vehicleFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="border-ink/10">
        <CardHeader>
          <CardTitle className="text-lg">{t("common.profile.driverDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={t("common.profile.availability")}
              value={
                driver?.status && driver.status !== "offline"
                  ? t("common.profile.online")
                  : t("common.profile.offline")
              }
            />
            <Stat
              label={t("common.profile.accountStatus")}
              value={
                status === "approved" ? t("common.approval.approved") : t("common.approval.pending")
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle">{t("common.profile.vehicle")}</Label>
            <Input
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder={t("common.profile.vehiclePlaceholder")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveVehicle} disabled={saving}>
              {saving ? t("common.actions.saving") : t("common.profile.saveVehicle")}
            </Button>
            <Button asChild variant="outline">
              <Link to="/driver">{t("common.profile.goToDeliveries")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <DriverVerification />
    </>
  );
}

function DriverVerification() {
  const t = useT();
  const { data: docs = [] } = useQuery(driverDocsQuery);
  const { data: driver } = useQuery(myDriverQuery);
  const types = requiredDocsFor(driver?.vehicle_type);

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">{t("driver.verification.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/60">{t("driver.verification.subtitle")}</p>
        <ul className="space-y-2">
          {types.map((type) => {
            const doc = docs.find((d) => d.doc_type === type.id);
            const state = doc?.status ?? "missing";
            return (
              <li
                key={type.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm break-words text-foreground">{t(type.labelKey)}</p>
                  {doc?.review_note ? (
                    <p className="text-xs break-words text-destructive">{doc.review_note}</p>
                  ) : null}
                </div>
                <Badge
                  variant={
                    state === "approved"
                      ? "default"
                      : state === "rejected"
                        ? "destructive"
                        : state === "pending"
                          ? "secondary"
                          : "outline"
                  }
                  className="shrink-0"
                >
                  {t(`driver.verification.state.${state}`)}
                </Badge>
              </li>
            );
          })}
        </ul>
        <Button asChild variant="outline" className="w-full">
          <Link to="/driver/documents">{t("driver.verification.manage")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
