import { Link } from "@tanstack/react-router";
import {
  BikeIcon,
  ClipboardList,
  FileText,
  Home,
  Receipt,
  Store,
  User,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string; icon: typeof Home };

const TABS: Record<"customer" | "vendor" | "driver", Tab[]> = {
  customer: [
    { to: "/customer", label: "Home", icon: Home },
    { to: "/customer/orders", label: "Orders", icon: Receipt },
    { to: "/profile", label: "Account", icon: User },
  ],
  vendor: [
    { to: "/vendor", label: "Orders", icon: ClipboardList },
    { to: "/vendor/menu", label: "Menu", icon: UtensilsCrossed },
    { to: "/vendor/store", label: "Store", icon: Store },
    { to: "/profile", label: "Account", icon: User },
  ],
  driver: [
    { to: "/driver", label: "Jobs", icon: BikeIcon },
    { to: "/driver/earnings", label: "Earnings", icon: Wallet },
    { to: "/driver/documents", label: "Documents", icon: FileText },
    { to: "/profile", label: "Account", icon: User },
  ],
};

export function TabBar({ role }: { role: "customer" | "vendor" | "driver" }) {
  const tabs = TABS[role];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-card/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-4xl">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <Link
              to={tab.to}
              activeOptions={{ exact: tab.to === "/customer" || tab.to === "/vendor" || tab.to === "/driver" }}
              className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground/60"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    className={cn("size-5", isActive ? "text-foreground" : "text-foreground/60")}
                    aria-hidden
                  />
                  {tab.label}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
