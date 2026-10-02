import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { SITE_COPY } from "./site-copy";

export function StoreSoonDialog({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
            <Smartphone className="size-7" aria-hidden />
          </div>
          <DialogTitle className="text-center">{c.soonTitle}</DialogTitle>
          <DialogDescription className="text-center">{c.soonBody}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild className="w-full">
            <Link to="/get-started" search={{ mode: "signup" }}>
              {c.soonWeb}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
