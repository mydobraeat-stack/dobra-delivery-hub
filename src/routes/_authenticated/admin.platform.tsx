import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  announcementsQuery,
  broadcast,
  platformSettingsQuery,
  savePlatformSettings,
} from "@/lib/admin-ops";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/platform")({
  component: PlatformPage,
});

function PlatformPage() {
  const qc = useQueryClient();
  const { formatDate } = useI18n();
  const { data } = useQuery(platformSettingsQuery);
  const ann = useQuery(announcementsQuery);
  const [msg, setMsg] = useState("");
  const [late, setLate] = useState("30");
  useEffect(() => {
    if (data) {
      setMsg(data.maintenance_message);
      setLate(String(data.late_threshold_minutes));
    }
  }, [data]);

  const save = async (patch: Parameters<typeof savePlatformSettings>[0], ok: string) => {
    try {
      await savePlatformSettings(patch);
      toast.success(ok);
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    const who = `${role || "all roles"}${country ? ` in ${country}` : ""}`;
    if (!window.confirm(`Send this announcement to ${who}? It goes out as an in-app and push notification.`)) return;
    setSending(true);
    try {
      const n = await broadcast(title, body, role || null, country || null);
      toast.success(`Sent to ${n} people`);
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform controls</h1>

      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Maintenance mode</h2>
            <p className="text-sm text-foreground/60">
              Customers see a "we'll be right back" screen instead of the app. Vendors, drivers and admins are not blocked.
            </p>
          </div>
          <label className="flex items-center gap-2 font-semibold">
            <Switch
              aria-label="Maintenance mode"
              checked={Boolean(data?.maintenance_mode)}
              onCheckedChange={(v) => save({ maintenance_mode: v }, v ? "Maintenance mode ON" : "Maintenance mode OFF")}
            />
            {data?.maintenance_mode ? "ON" : "OFF"}
          </label>
        </div>
        <div className="space-y-1">
          <Label htmlFor="mm-msg">Message shown to customers</Label>
          <Textarea id="mm-msg" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="outline" onClick={() => save({ maintenance_message: msg }, "Message saved")}>
            Save message
          </Button>
          <div className="space-y-1">
            <Label htmlFor="late">Flag orders as late after ETA + (minutes)</Label>
            <Input id="late" type="number" className="w-28" value={late} onChange={(e) => setLate(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => save({ late_threshold_minutes: Number(late) || 30 }, "Saved")}>
            Save threshold
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-bold">Broadcast announcement</h2>
          <p className="text-sm text-foreground/60">Sends an in-app notification plus a push to devices that allowed notifications.</p>
        </div>
        <Input aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea aria-label="Message" placeholder="Message" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <select aria-label="Audience role" className={sel} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Everyone</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="driver">Drivers</option>
          </select>
          <select aria-label="Audience country" className={sel} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            <option>Poland</option>
            <option>Cameroon</option>
          </select>
          <Button onClick={send} disabled={sending || !title.trim() || !body.trim()}>
            {sending ? "Sending…" : "Send announcement"}
          </Button>
        </div>
        <div className="space-y-2 border-t border-ink/10 pt-3">
          {(ann.data ?? []).map((a) => (
            <div key={a.id} className="text-sm">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-foreground/60">
                {formatDate(a.created_at)} · {a.target_role ?? "everyone"} · {a.target_country ?? "all countries"} · {a.recipients} recipients
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
