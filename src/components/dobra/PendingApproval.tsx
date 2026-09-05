import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PendingApproval({ what }: { what: string }) {
  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="text-lg">Your {what} account is pending approval</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-foreground/70">
        Our team is reviewing your details. You'll get access to the full dashboard as soon as
        you're approved.
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
