import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DishDialog,
  MenuSection,
  RestaurantSwitcher,
  useVendorRestaurant,
} from "@/components/dobra/vendor-parts";
import type { MenuItem } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/vendor/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Dobra for restaurants" },
      { name: "description", content: "Add dishes, photos and prices to your Dobra menu." },
      { property: "og:title", content: "Menu — Dobra for restaurants" },
      { property: "og:description", content: "Add dishes, photos and prices to your Dobra menu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendorMenuPage,
});

function VendorMenuPage() {
  const { restaurantId, items, isLoading } = useVendorRestaurant();
  const [dishForm, setDishForm] = useState<{ open: boolean; editing: MenuItem | null }>({
    open: false,
    editing: null,
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">Menu</h1>
      <RestaurantSwitcher />

      {isLoading ? (
        <p className="text-sm text-foreground/60">Loading…</p>
      ) : !restaurantId ? (
        <p className="text-sm text-foreground/60">Create your restaurant first on the Store tab.</p>
      ) : (
        <>
          <MenuSection
            items={items}
            onAdd={() => setDishForm({ open: true, editing: null })}
            onEdit={(item) => setDishForm({ open: true, editing: item })}
          />
          <DishDialog
            open={dishForm.open}
            editing={dishForm.editing}
            restaurantId={restaurantId}
            onOpenChange={(open) => setDishForm((s) => ({ ...s, open }))}
          />
        </>
      )}
    </main>
  );
}
