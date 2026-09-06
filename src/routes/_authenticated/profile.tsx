import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/dobra/AppHeader";
import { ImageUpload } from "@/components/dobra/ImageUpload";
import { accountQueryOptions } from "@/lib/profile";
import { myOrdersQuery, myDriverQuery, vendorRestaurantsQuery, money } from "@/lib/dobra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Dobra" },
      { name: "description", content: "Manage your Dobra profile, photo and contact details." },
      { property: "og:title", content: "Your profile — Dobra" },
      {
        property: "og:description",
        content: "Manage your Dobra profile, photo and contact details.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const myProfileQuery = queryOptions({
  queryKey: ["my-profile"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id;
    if (!id) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, country, phone, avatar_url, approval_status, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return { ...data, id, email: data?.email ?? auth.user?.email ?? null };
  },
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: profile } = useQuery(myProfileQuery);
  const role = account?.role ?? "customer";

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      toast.success("Profile saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader subtitle="Profile" />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Your profile</h1>
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        </div>

        <Card className="border-ink/10">
          <CardHeader>
            <CardTitle className="text-lg">Personal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              bucket="profile-photos"
              value={avatar}
              onChange={setAvatar}
              label="Profile photo"
            />
            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+48 600 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Poland"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} readOnly disabled />
            </div>
            <Button onClick={save} disabled={saving || !profile}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        {role === "customer" ? <CustomerSection /> : null}
        {role === "vendor" ? <VendorSection status={profile?.approval_status ?? null} /> : null}
        {role === "driver" ? <DriverSection status={profile?.approval_status ?? null} /> : null}
      </main>
      {role === "customer" || role === "vendor" || role === "driver" ? (
        <TabBar role={role} />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-muted/50 px-4 py-3">
      <div className="text-xs text-foreground/60">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function CustomerSection() {
  const { data: orders } = useQuery(myOrdersQuery);
  const list = orders ?? [];
  const spent = list
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">Your ordering</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Orders placed" value={String(list.length)} />
          <Stat label="Total spent" value={money(spent, list[0]?.currency ?? "EUR")} />
        </div>
        <Button asChild variant="outline">
          <Link to="/customer">Browse restaurants</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function VendorSection({ status }: { status: string | null | undefined }) {
  const { data: restaurants } = useQuery(vendorRestaurantsQuery);
  const list = restaurants ?? [];

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">Your business</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Restaurants" value={String(list.length)} />
          <Stat label="Account status" value={status === "approved" ? "Approved" : "Pending"} />
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
          <Link to="/vendor">Open dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DriverSection({ status }: { status: string | null | undefined }) {
  const queryClient = useQueryClient();
  const { data: driver } = useQuery(myDriverQuery);
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
      toast.success("Vehicle saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">Driver details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Availability" value={driver?.status === "online" ? "Online" : "Offline"} />
          <Stat label="Account status" value={status === "approved" ? "Approved" : "Pending"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle</Label>
          <Input
            id="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Bike, scooter, car…"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={saveVehicle} disabled={saving}>
            {saving ? "Saving…" : "Save vehicle"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/driver">Go to deliveries</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
