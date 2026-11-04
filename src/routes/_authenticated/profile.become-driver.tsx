import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bike, Camera, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { accountQueryOptions } from "@/lib/profile";
import { canApplyAsDriver } from "@/lib/account-mode";
import { startDriverApplication } from "@/lib/driver-application";
import { useT } from "@/lib/i18n";
import { DobraLogo } from "@/components/dobra/Logo";

export const Route = createFileRoute("/_authenticated/profile/become-driver")({
  head: () => ({ meta: [
    { title: "Become a driver — Dobra" },
    { name: "description", content: "Apply to deliver with Dobra using your existing customer account." },
    { property: "og:title", content: "Become a driver — Dobra" },
    { property: "og:description", content: "Prepare your vehicle, photos and phone for a Dobra driver application." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: BecomeDriver,
});

function BecomeDriver() {
  const t = useT();
  const { data: account } = useQuery(accountQueryOptions);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const start = useMutation({ mutationFn: startDriverApplication, onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["account"] });
    await queryClient.invalidateQueries({ queryKey: ["driver"] });
    await navigate({ to: "/driver/documents" });
  }, onError: () => toast.error(t("driver.application.error")) });
  const eligible = account && canApplyAsDriver(account.roles);
  return <main className="mx-auto max-w-lg space-y-6 px-5 py-6">
    <ProfileBackLink label={t("common.actions.back")} />
    <DobraLogo className="text-4xl" />
    <div className="space-y-3"><h1 className="text-3xl font-bold">{t("driver.application.title")}</h1><p className="text-foreground/80">{t("driver.application.intro")}</p></div>
    <ul className="space-y-5">{([
      [Bike, "vehicle"], [Camera, "identity"], [Phone, "phone"], [ShieldCheck, "review"],
    ] as const).map(([Icon, key]) => <li key={key} className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-card text-brand"><Icon className="size-6" /></span>
      <div><h2 className="font-bold">{t(`driver.application.${key}`)}</h2><p className="mt-1 text-sm text-foreground/80">{t(`driver.application.${key}Body`)}</p></div>
    </li>)}</ul>
    {eligible ? <Button className="h-12 w-full" disabled={start.isPending} onClick={() => start.mutate()}>{t("driver.application.start")}<ArrowRight className="size-4" /></Button> : <Button asChild variant="outline"><Link to="/profile">{t("common.actions.back")}</Link></Button>}
  </main>;
}