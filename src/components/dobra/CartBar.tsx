import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useShellMaxWidth } from "./PhoneFrame";
import { cn } from "@/lib/utils";

export function CartBar({ raised }: { raised?: boolean } = {}) {
  const { t, formatMoney } = useI18n();
  const cart = useCart();
  const count = cartCount(cart);
  const maxW = useShellMaxWidth();
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "fixed left-1/2 z-40 w-full -translate-x-1/2 border-t border-ink/10 bg-card/95 backdrop-blur",
        maxW,
        raised ? "bottom-16" : "bottom-0",
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="size-5 text-primary-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {count === 1 ? t("customer.cart.itemSingular", { n: count }) : t("customer.cart.itemPlural", { n: count })} · {formatMoney(cartSubtotal(cart))}
            </p>
            <p className="text-xs text-foreground/60">{cart.restaurantName}</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/checkout">{t("customer.cart.viewBasket")}</Link>
        </Button>
      </div>
    </div>
  );
}
