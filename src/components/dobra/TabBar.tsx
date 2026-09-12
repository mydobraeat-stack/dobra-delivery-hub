import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Home,
  LifeBuoy,
  Package,
  Receipt,
  Store,
  User,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = { to: string; labelKey: string; icon: typeof Home };

const TABS: Record<"customer" | "vendor" | "driver", Tab[]> = {
  customer: [
    { to: "/customer", labelKey: "common.tabs.home", icon: Home },
    { to: "/customer/orders", labelKey: "common.tabs.orders", icon: Receipt },
    { to: "/profile", labelKey: "common.tabs.account", icon: User },
  ],
  vendor: [
    { to: "/vendor", labelKey: "common.tabs.orders", icon: ClipboardList },
    { to: "/vendor/menu", labelKey: "common.tabs.menu", icon: UtensilsCrossed },
    { to: "/vendor/store", labelKey: "common.tabs.store", icon: Store },
    { to: "/profile", labelKey: "common.tabs.account", icon: User },
  ],
  driver: [
    { to: "/driver", labelKey: "common.tabs.home", icon: Home },
    { to: "/driver/earnings", labelKey: "common.tabs.earnings", icon: Wallet },
    { to: "/driver/deliveries", labelKey: "common.tabs.deliveries", icon: Package },
    { to: "/driver/help", labelKey: "common.tabs.help", icon: LifeBuoy },
  ],
};

export function TabBar({ role }: { role: "customer" | "vendor" | "driver" }) {
  const tabs = TABS[role];
  const t = useT();

  return (
    <nav
      aria-label={t("common.navAria")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-card/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-4xl">
        {tabs.map((tab) => (
          <li key={tab.to} className="min-w-0 flex-1">
            <Link
              to={tab.to}
              activeOptions={{ exact: tab.to === "/customer" || tab.to === "/vendor" || tab.to === "/driver" }}
              className="flex w-full min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-center text-[11px] leading-tight text-foreground/60 sm:text-xs"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    className={cn("size-5 shrink-0", isActive ? "text-foreground" : "text-foreground/60")}
                    aria-hidden
                  />
                  <span className="w-full truncate">{t(tab.labelKey)}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
