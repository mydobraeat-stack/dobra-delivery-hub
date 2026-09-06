import { Link } from "@tanstack/react-router";
import { Clock, LifeBuoy, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOC_TYPES, driverDocsQuery } from "@/lib/driver-docs";
import type { DriverRecord } from "@/lib/dobra";

export type DriverApproval = "pending" | "approved" | "rejected";

/** Works out the driver's approval state from their account and document record. */
export function driverApproval(
  approvalStatus: string | undefined,
  driver: DriverRecord | null | undefined,
): DriverApproval {
  if (approvalStatus === "rejected" || driver?.docs_status === "rejected") return "rejected";
  if (approvalStatus === "approved" && driver?.docs_status !== "in_review") return "approved";
  return "pending";
}

export function ApplicationUnderReview({ driver }: { driver: DriverRecord | null | undefined }) {
  const { data: docs = [] } = useQuery(driverDocsQuery);

  const rows = [
    ...DOC_TYPES.map((d) => ({
      label: d.label,
      done: docs.some((doc) => doc.doc_type === d.id),
    })),
    {
      label: `Vehicle: ${driver?.vehicle_type ?? "not set"}${driver?.plate ? ` · ${driver.plate}` : ""}`,
      done: Boolean(driver?.vehicle_type),
    },
  ];

  return (
    <main className="mx-auto max-w-lg space-y-5 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-sun/30">
          <Clock className="size-5 text-foreground" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-foreground">Application under review</h1>
      </div>
      <p className="text-sm text-foreground/70">
        Your account and documents are being reviewed. We'll notify you once approved.
      </p>

      <Card className="border-ink/10">
        <CardHeader>
          <CardTitle className="text-base">What you submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 px-3 py-2"
            >
              <span className="text-sm text-foreground">{r.label}</span>
              <Badge variant={r.done ? "secondary" : "outline"} className="shrink-0">
                {r.done ? "Pending review" : "Missing"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="w-full">
        <Link to="/driver/documents">Update my documents</Link>
      </Button>
    </main>
  );
}

export function ApplicationRejected() {
  return (
    <main className="mx-auto max-w-lg space-y-5 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-destructive/15">
          <ShieldAlert className="size-5 text-destructive" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-foreground">Application not approved</h1>
      </div>
      <p className="text-sm text-foreground/70">
        We couldn't approve your driver account this time. This usually happens when a document is
        unreadable, expired, or doesn't match your details. Our support team can tell you exactly
        what to fix and help you re-apply.
      </p>
      <div className="flex flex-col gap-2">
        <Button asChild>
          <a href="mailto:support@dobra.app?subject=Driver%20application%20review">
            <LifeBuoy className="size-4" aria-hidden /> Contact support
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/driver/documents">Re-upload documents</Link>
        </Button>
      </div>
    </main>
  );
}
