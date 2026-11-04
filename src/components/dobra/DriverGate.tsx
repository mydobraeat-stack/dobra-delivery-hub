import { Link } from "@tanstack/react-router";
import { Clock, LifeBuoy, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requiredDocsFor, driverDocsQuery } from "@/lib/driver-docs";
import { isDriverApproved } from "@/lib/account-mode";
import { useT } from "@/lib/i18n";
import type { DriverRecord } from "@/lib/dobra";

export type DriverApproval = "pending" | "approved" | "rejected";

/** Works out the driver's approval state from their account and document record. */
export function driverApproval(
  approvalStatus: string | undefined,
  driver: DriverRecord | null | undefined,
): DriverApproval {
  if ((!driver?.existing_customer && approvalStatus === "rejected") || driver?.docs_status === "rejected") return "rejected";
  if (isDriverApproved(driver?.existing_customer ? "approved" : approvalStatus, driver?.docs_status)) return "approved";
  return "pending";
}

export function ApplicationUnderReview({ driver }: { driver: DriverRecord | null | undefined }) {
  const { data: docs = [] } = useQuery(driverDocsQuery);
  const t = useT();

  const rows = [
    ...requiredDocsFor(driver?.vehicle_type).map((d) => ({
      label: t(d.labelKey),
      done: docs.some((doc) => doc.doc_type === d.id),
    })),
    {
      label: t("driver.gate.vehicleLabel", {
        type: driver?.vehicle_type ?? t("driver.gate.notSet"),
        plate: driver?.plate ? ` · ${driver.plate}` : "",
      }),
      done: Boolean(driver?.vehicle_type),
    },
  ];

  return (
    <main className="mx-auto max-w-lg space-y-5 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-sun/30">
          <Clock className="size-5 text-foreground" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-foreground">{t("driver.gate.underReviewTitle")}</h1>
      </div>
      <p className="text-sm text-foreground/70">{t("driver.gate.underReviewBody")}</p>

      <Card className="border-ink/10">
        <CardHeader>
          <CardTitle className="text-base">{t("driver.gate.submittedTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 px-3 py-2"
            >
              <span className="text-sm text-foreground">{r.label}</span>
              <Badge variant={r.done ? "secondary" : "outline"} className="shrink-0">
                {r.done ? t("driver.gate.pendingReview") : t("driver.gate.missing")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="w-full">
        <Link to="/driver/documents">{t("driver.gate.updateDocuments")}</Link>
      </Button>
    </main>
  );
}

export function ApplicationRejected() {
  const t = useT();
  return (
    <main className="mx-auto max-w-lg space-y-5 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-destructive/15">
          <ShieldAlert className="size-5 text-destructive" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-foreground">{t("driver.gate.rejectedTitle")}</h1>
      </div>
      <p className="text-sm text-foreground/70">{t("driver.gate.rejectedBody")}</p>
      <div className="flex flex-col gap-2">
        <Button asChild>
          <a href="mailto:support@dobra.app?subject=Driver%20application%20review">
            <LifeBuoy className="size-4" aria-hidden /> {t("driver.gate.contactSupport")}
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/driver/documents">{t("driver.gate.reupload")}</Link>
        </Button>
      </div>
    </main>
  );
}
