import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { Card, CardContent } from "@/components/ui/card";
import { driverOrdersQuery, orderRef, payout, restaurantsQuery } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/driver/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — Dobra for drivers" },
      { name: "description", content: "Track what you earned today and across all deliveries." },
      { property: "og:title", content: "Earnings — Dobra for drivers" },
      {
        property: "og:description",
        content: "Track what you earned today and across all deliveries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverEarnings,
});

function DriverEarnings() {
  const { t, formatMoney, formatDate } = useI18n();
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });

  if (!approved) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">{t("driver.earnings.title")}</h1>
        <PendingApproval what="driver" />
      </main>
    );
  }

  const restaurantName = (id: string | null) =>
    !id
      ? t("package.orderLabel")
      : (restaurants.find((r) => r.id === id)?.name ?? t("driver.home.restaurantFallback"));
  const completed = (data?.mine ?? []).filter((o) => o.status === "delivered");
  const total = completed.reduce((sum, o) => sum + payout(Number(o.total)), 0);
  const today = new Date().toDateString();
  const todayTotal = completed
    .filter((o) => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + payout(Number(o.total)), 0);
  const week = completed.filter(
    (o) => Date.now() - new Date(o.created_at).getTime() < 7 * 24 * 3600 * 1000,
  );
  const weekTotal = week.reduce((sum, o) => sum + payout(Number(o.total)), 0);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">{t("driver.earnings.title")}</h1>

      <section className="grid grid-cols-2 gap-3">
        <Stat label={t("driver.earnings.today")} value={formatMoney(todayTotal)} />
        <Stat label={t("driver.earnings.last7")} value={formatMoney(weekTotal)} />
        <Stat label={t("driver.earnings.allTime")} value={formatMoney(total)} />
        <Stat label={t("driver.earnings.deliveriesDone")} value={String(completed.length)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.earnings.paymentHistory")}</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("driver.earnings.noneCompleted")}</p>
        ) : (
          completed.map((o) => (
            <Card key={o.id} className="border-ink/10">
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {restaurantName(o.restaurant_id)}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {orderRef(o.id)} · {formatDate(o.created_at)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatMoney(payout(Number(o.total)), o.currency)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-ink/10">
      <CardContent className="py-4">
        <p className="text-xs text-foreground/60">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
