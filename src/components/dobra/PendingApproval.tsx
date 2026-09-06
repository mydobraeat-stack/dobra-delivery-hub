import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

export function PendingApproval({ what }: { what: string }) {
  const t = useT();
  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">{t("vendor.pendingApproval.title", { what })}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-foreground/70">
        {t("vendor.pendingApproval.body")}
      </CardContent>
    </Card>
  );
}

export function Placeholder({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-ink/20 bg-muted/60 px-4 py-10 text-center text-sm text-foreground/60">
          {hint}
        </div>
      </CardContent>
    </Card>
  );
}
