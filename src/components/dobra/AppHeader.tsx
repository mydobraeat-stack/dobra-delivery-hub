import { Link, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DobraLogo } from "./Logo";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-baseline gap-3">
          <DobraLogo className="text-3xl" />
          {subtitle ? (
            <span className="text-sm font-medium text-foreground/70">{subtitle}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile" aria-label="Your profile">
              <User className="size-4" aria-hidden />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
