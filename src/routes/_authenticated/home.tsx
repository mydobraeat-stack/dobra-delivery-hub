import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountQueryOptions } from "@/lib/profile";
import { DobraLogo } from "@/components/dobra/Logo";

export const Route = createFileRoute("/_authenticated/home")({
  component: RoleRouter,
});

function RoleRouter() {
  const navigate = useNavigate();
  const { data } = useQuery(accountQueryOptions);

  useEffect(() => {
    if (!data) return;
    if (data.role === "admin") navigate({ to: "/admin", replace: true });
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
