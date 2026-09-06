import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart";
import { money } from "@/lib/dobra";
import { Button } from "@/components/ui/button";

export function CartBar({ raised }: { raised?: boolean } = {}) {
  const cart = useCart();
  const count = cartCount(cart);
  if (count === 0) return null;

  return (
    <div className={`fixed inset-x-0 z-40 border-t border-ink/10 bg-card/95 backdrop-blur ${raised ? "bottom-16" : "bottom-0"}`}>
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="size-5 text-primary-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {count} {count === 1 ? "item" : "items"} · {money(cartSubtotal(cart))}
            </p>
            <p className="text-xs text-foreground/60">{cart.restaurantName}</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/checkout">View basket</Link>
        </Button>
      </div>
    </div>
  );
}
