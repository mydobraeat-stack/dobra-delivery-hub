import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dobra/AppHeader";
import { StoredImage } from "@/components/dobra/StoredImage";
import { cartSubtotal, clearCart, setQuantity, useCart } from "@/lib/cart";
import { money, placeOrder, restaurantQuery } from "@/lib/dobra";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Dobra" },
      { name: "description", content: "Review your basket and confirm your Dobra delivery." },
      { property: "og:title", content: "Checkout — Dobra" },
      {
        property: "og:description",
        content: "Review your basket and confirm your Dobra delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...restaurantQuery(cart.restaurantId ?? ""),
    enabled: Boolean(cart.restaurantId),
  });
  const restaurant = data?.restaurant ?? null;

  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const subtotal = cartSubtotal(cart);
  const fee = Number(restaurant?.delivery_fee ?? 0);
  const total = subtotal + fee;
  const belowMinimum = restaurant ? subtotal < Number(restaurant.min_order ?? 0) : false;

  const submit = useMutation({
    mutationFn: () =>
      placeOrder({ restaurant: restaurant!, lines: cart.lines, address: address.trim(), note }),
    onSuccess: (orderId) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed — pay the driver on delivery.");
      navigate({ to: "/orders/$orderId", params: { orderId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Customer" />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Keep browsing
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Your basket</h1>

        {cart.lines.length === 0 ? (
          <p className="text-sm text-foreground/60">Your basket is empty.</p>
        ) : (
          <>
            <Card className="border-ink/10">
              <CardContent className="space-y-4 py-4">
                <p className="font-semibold text-foreground">{cart.restaurantName}</p>
                {cart.lines.map((line) => (
                  <div key={line.itemId} className="flex items-center gap-3">
                    <StoredImage
                      value={line.image}
                      alt={line.name}
                      width={160}
                      height={160}
                      className="size-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                      <p className="text-xs text-foreground/60">
                        {money(line.price * line.quantity, line.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Remove one ${line.name}`}
                        onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                      >
                        {line.quantity === 1 ? (
                          <Trash2 className="size-4" />
                        ) : (
                          <Minus className="size-4" />
                        )}
                      </Button>
                      <span className="w-4 text-center text-sm font-semibold">{line.quantity}</span>
                      <Button
                        size="icon"
                        aria-label={`Add one ${line.name}`}
                        onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardContent className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, building, flat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note for the restaurant (optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ring the bell, no onions…"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardContent className="space-y-2 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Delivery</span>
                  <span>{money(fee)}</span>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
                <p className="pt-2 text-xs text-foreground/60">
                  Payment: cash or card to the driver on delivery.
                </p>
              </CardContent>
            </Card>

            {belowMinimum ? (
              <p className="text-sm text-destructive">
                Minimum order for this restaurant is {money(Number(restaurant?.min_order ?? 0))}.
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              disabled={
                submit.isPending || !restaurant || belowMinimum || address.trim().length < 5
              }
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? "Placing order…" : `Place order · ${money(total)}`}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
