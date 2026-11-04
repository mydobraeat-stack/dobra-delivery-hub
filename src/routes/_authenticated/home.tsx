import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountQueryOptions } from "@/lib/profile";
import { DobraLogo } from "@/components/dobra/Logo";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [
    { title: "Your Dobra mode" }, { name: "description", content: "Open your saved Dobra customer, driver or partner workspace." },
    { property: "og:title", content: "Your Dobra mode" }, { property: "og:description", content: "Continue in your preferred Dobra workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: RoleRouter,
});

function RoleRouter() {
  const navigate = useNavigate();
  const { data } = useQuery(accountQueryOptions);

  useEffect(() => {
    if (!data) return;
    if (data.role === "admin" || data.role === "support_agent") navigate({ to: "/admin", replace: true });
    else if (data.role === "vendor") navigate({ to: "/vendor", replace: true });
    else if (data.role === "driver") navigate({ to: "/driver", replace: true });
    else navigate({ to: "/customer", replace: true });
  }, [data, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <DobraLogo className="animate-pulse text-5xl" />
    </div>
  );
}
