import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { StoredImage } from "@/components/dobra/StoredImage";
import { ImageUpload } from "@/components/dobra/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MENU_CATEGORIES,
  ORDER_FLOW,
  setRestaurantOpen,
  cancelOrder,
  createMenuItem,
  createRestaurant,
  deleteMenuItem,
  money,
  orderItemsQuery,
  orderRef,
  restaurantQuery,
  toggleItemAvailability,
  updateMenuItem,
  updateOrderStatus,
  updateRestaurant,
  vendorOrdersQuery,
  vendorRestaurantsQuery,
  type MenuItem,
  type OrderRow,
  type Restaurant,
  type RestaurantInput,
} from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — Dobra" },
      { name: "description", content: "Manage your restaurant's orders and menu on Dobra." },
      { property: "og:title", content: "Vendor Dashboard — Dobra" },
      {
        property: "og:description",
        content: "Manage your restaurant's orders and menu on Dobra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorDashboard,
});

const NEXT_LABEL: Record<string, string> = {
  pending: "Accept order",
  accepted: "Start preparing",
  preparing: "Mark ready",
};

const EMPTY_RESTAURANT: RestaurantInput = {
  name: "",
  cuisine: "",
  city: "",
  country: "Poland",
  eta_minutes: 30,
  delivery_fee: 5,
  min_order: 0,
  logo_url: null,
};

function VendorDashboard() {
  const { data: account } = useQuery(accountQueryOptions);
  const { data: restaurants = [], isLoading: loadingRestaurants } =
    useQuery(vendorRestaurantsQuery);
  const [selected, setSelected] = useState<string | null>(null);
  const restaurantId = selected ?? restaurants[0]?.id;

  const { data: orders = [] } = useQuery(vendorOrdersQuery(restaurantId));
  const { data: detail } = useQuery({
    ...restaurantQuery(restaurantId ?? ""),
    enabled: Boolean(restaurantId),
  });

  const [restaurantForm, setRestaurantForm] = useState<{
    open: boolean;
    editing: Restaurant | null;
  }>({ open: false, editing: null });
  const [dishForm, setDishForm] = useState<{ open: boolean; editing: MenuItem | null }>({
    open: false,
    editing: null,
  });

  const restaurant = detail?.restaurant ?? null;
  const items = detail?.items ?? [];
  const queryClient = useQueryClient();

  const toggleOpen = useMutation({
    mutationFn: (isOpen: boolean) => setRestaurantOpen(restaurant!.id, isOpen),
    onSuccess: (_d, isOpen) => {
      toast.success(isOpen ? "You are open for orders." : "You are closed — new orders paused.");
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const newOrderCount = orders.filter((o) => o.status === "pending").length;
  const seenRef = useRef<number | null>(null);
  useEffect(() => {
    if (seenRef.current !== null && newOrderCount > seenRef.current) {
      toast.success("New order just came in!");
    }
    seenRef.current = newOrderCount;
  }, [newOrderCount]);

  const today = new Date().toDateString();
  const delivered = orders.filter((o) => o.status === "delivered");
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrder = delivered.length
    ? delivered.reduce((sum, o) => sum + Number(o.total), 0) / delivered.length
    : 0;
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Vendor" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Vendor dashboard</h1>
          {restaurants.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRestaurantForm({ open: true, editing: null })}
            >
              <Plus className="size-4" aria-hidden /> Add restaurant
            </Button>
          ) : null}
        </div>

        {account?.approvalStatus !== "approved" ? (
          <Card className="border-ink/10 bg-primary/20">
            <CardContent className="py-4 text-sm text-foreground">
              Your account is still being reviewed. You can set up your restaurant and menu now —
              customers will see it as soon as you are approved.
            </CardContent>
          </Card>
        ) : null}

        {loadingRestaurants ? (
          <p className="text-sm text-foreground/60">Loading your restaurant…</p>
        ) : restaurants.length === 0 ? (
          <Card className="border-ink/10">
            <CardContent className="space-y-3 py-6 text-center">
              <h2 className="text-lg font-bold text-foreground">Create your restaurant</h2>
              <p className="text-sm text-foreground/60">
                Add your name, city and logo to start building your menu.
              </p>
              <Button onClick={() => setRestaurantForm({ open: true, editing: null })}>
                <Plus className="size-4" aria-hidden /> Create restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {restaurants.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {restaurants.map((r) => (
                  <Button
                    key={r.id}
                    size="sm"
                    variant={r.id === restaurantId ? "default" : "outline"}
                    onClick={() => setSelected(r.id)}
                  >
                    {r.name}
                  </Button>
                ))}
              </div>
            ) : null}

            {restaurant ? (
              <Card className="overflow-hidden border-ink/10">
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <StoredImage
                    value={restaurant.logo_url}
                    alt={restaurant.name}
                    className="size-24 shrink-0 rounded-xl object-cover"
                    width={640}
                    height={512}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{restaurant.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          restaurant.status === "approved"
                            ? "bg-ink text-primary"
                            : "bg-muted text-foreground/70"
                        }`}
                      >
                        {restaurant.status === "approved" ? "Live" : "Pending approval"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      {restaurant.cuisine} · {restaurant.city}, {restaurant.country}
                    </p>
                    <p className="pt-1 text-xs text-foreground/70">
                      {activeOrders.length} active order{activeOrders.length === 1 ? "" : "s"} ·{" "}
                      {money(revenue)} delivered revenue · {restaurant.eta_minutes} min ·{" "}
                      delivery {money(restaurant.delivery_fee)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="open-toggle"
                        checked={restaurant.is_open}
                        disabled={toggleOpen.isPending}
                        onCheckedChange={(v) => toggleOpen.mutate(v)}
                      />
                      <Label htmlFor="open-toggle" className="text-xs">
                        {restaurant.is_open ? "Open" : "Closed"}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRestaurantForm({ open: true, editing: restaurant })}
                    >
                      Edit details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-4">
              <StatCard label="Orders today" value={String(todayOrders.length)} />
              <StatCard label="Revenue today" value={money(todayRevenue)} />
              <StatCard label="Delivered all time" value={String(delivered.length)} />
              <StatCard label="Average order" value={money(avgOrder)} />
            </section>

            <OrdersSection
              title={`Active orders${newOrderCount ? ` · ${newOrderCount} new` : ""}`}
              orders={activeOrders}
              emptyText="No orders in progress."
              actionable
            />

            <MenuSection
              items={items}
              onAdd={() => setDishForm({ open: true, editing: null })}
              onEdit={(item) => setDishForm({ open: true, editing: item })}
            />

            <OrdersSection
              title="Completed orders"
              orders={completedOrders}
              emptyText="Nothing completed yet."
            />
          </>
        )}

        <RestaurantDialog
          open={restaurantForm.open}
          editing={restaurantForm.editing}
          onOpenChange={(open) => setRestaurantForm((s) => ({ ...s, open }))}
          onCreated={(id) => setSelected(id)}
        />

        {restaurantId ? (
          <DishDialog
            open={dishForm.open}
            editing={dishForm.editing}
            restaurantId={restaurantId}
            onOpenChange={(open) => setDishForm((s) => ({ ...s, open }))}
          />
        ) : null}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-ink/10">
      <CardContent className="py-4">
        <p className="text-xs text-foreground/60">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function OrdersSection({
  title,
  orders,
  emptyText,
  actionable,
}: {
  title: string;
  orders: OrderRow[];
  emptyText: string;
  actionable?: boolean;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      toast.success("Order cancelled.");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-foreground/60">{emptyText}</p>
      ) : (
        orders.map((o) => {
          const next = ORDER_FLOW[ORDER_FLOW.indexOf(o.status as never) + 1];
          const label = NEXT_LABEL[o.status];
          const isOpen = expanded === o.id;
          return (
            <Card key={o.id} className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{orderRef(o.id)}</p>
                    <p className="text-xs text-foreground/60">
                      {money(o.total, o.currency)} ·{" "}
                      {new Date(o.created_at).toLocaleString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.status} />
                    {actionable && label && next ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: next })}
                      >
                        {label}
                      </Button>
                    ) : null}
                    {actionable && ["pending", "accepted", "preparing", "ready"].includes(o.status) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={cancel.isPending}
                        onClick={() => cancel.mutate(o.id)}
                      >
                        Cancel
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : o.id)}
                    >
                      {isOpen ? (
                        <ChevronUp className="size-4" aria-hidden />
                      ) : (
                        <ChevronDown className="size-4" aria-hidden />
                      )}
                      Items
                    </Button>
                  </div>
                </div>
                {isOpen ? <OrderItems orderId={o.id} currency={o.currency} /> : null}
              </CardContent>
            </Card>
          );
        })
      )}
    </section>
  );
}

function OrderItems({ orderId, currency }: { orderId: string; currency: string }) {
  const { data = [], isLoading } = useQuery(orderItemsQuery(orderId));

  if (isLoading) return <p className="text-xs text-foreground/60">Loading items…</p>;
  if (data.length === 0) return <p className="text-xs text-foreground/60">No items recorded.</p>;

  return (
    <ul className="space-y-1 border-t border-ink/10 pt-3">
      {data.map((row: any) => (
        <li key={row.id} className="flex justify-between text-sm text-foreground/80">
          <span>
            {row.quantity}× {row.menu_items?.name ?? "Item"}
          </span>
          <span>{money(Number(row.price) * Number(row.quantity), currency)}</span>
        </li>
      ))}
    </ul>
  );
}

function MenuSection({
  items,
  onAdd,
  onEdit,
}: {
  items: MenuItem[];
  onAdd: () => void;
  onEdit: (item: MenuItem) => void;
}) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["restaurant"] });

  const toggle = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      toggleItemAvailability(id, available),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      toast.success("Dish removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Menu</h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-4" aria-hidden /> Add dish
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Your menu is empty — add your first dish so customers can order.
        </p>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="border-ink/10">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <StoredImage
                value={item.image_url}
                alt={item.name}
                className="size-16 shrink-0 rounded-xl object-cover"
                width={640}
                height={512}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-foreground/70">{money(item.price, item.currency)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/60">
                  {item.available ? "Available" : "Hidden"}
                </span>
                <Switch
                  checked={item.available}
                  aria-label={`Toggle availability for ${item.name}`}
                  onCheckedChange={(checked) => toggle.mutate({ id: item.id, available: checked })}
                />
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${item.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(item.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
}

function RestaurantDialog({
  open,
  editing,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  editing: Restaurant | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RestaurantInput>(EMPTY_RESTAURANT);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            cuisine: editing.cuisine ?? "",
            city: editing.city ?? "",
            country: editing.country ?? "Poland",
            eta_minutes: editing.eta_minutes,
            delivery_fee: Number(editing.delivery_fee),
            min_order: Number(editing.min_order ?? 0),
            logo_url: editing.logo_url,
          }
        : EMPTY_RESTAURANT,
    );
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Please enter a restaurant name.");
      if (editing) {
        await updateRestaurant(editing.id, form);
        return editing.id;
      }
      return createRestaurant(form);
    },
    onSuccess: (id) => {
      toast.success(editing ? "Restaurant updated." : "Restaurant created.");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      if (!editing) onCreated(id);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit restaurant" : "Create your restaurant"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update how your restaurant appears to customers."
              : "New restaurants go live once the Dobra team approves them."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            bucket="restaurant-logos"
            label="Restaurant photo"
            value={form.logo_url}
            onChange={(logo_url) => setForm((f) => ({ ...f, logo_url }))}
          />
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Forno Rosso"
            />
          </Field>
          <Field label="Cuisine">
            <Input
              value={form.cuisine}
              onChange={(e) => setForm((f) => ({ ...f, cuisine: e.target.value }))}
              placeholder="Pizza · Italian"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Warsaw"
              />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </Field>
            <Field label="Delivery time (min)">
              <Input
                type="number"
                min={5}
                value={form.eta_minutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eta_minutes: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Delivery fee (PLN)">
              <Input
                type="number"
                min={0}
                step="0.5"
                value={form.delivery_fee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, delivery_fee: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Minimum order (PLN)">
              <Input
                type="number"
                min={0}
                step="1"
                value={form.min_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, min_order: Number(e.target.value) || 0 }))
                }
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {editing ? "Save changes" : "Create restaurant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DishDialog({
  open,
  editing,
  restaurantId,
  onOpenChange,
}: {
  open: boolean;
  editing: MenuItem | null;
  restaurantId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Mains");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setPrice(editing ? String(editing.price) : "0");
    setDescription(editing?.description ?? "");
    setCategory(editing?.category ?? "Mains");
    setImageUrl(editing?.image_url ?? null);
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Please enter a dish name.");
      const payload = {
        name: name.trim(),
        price: Number(price) || 0,
        currency: editing?.currency ?? "PLN",
        image_url: imageUrl,
        description: description.trim() || null,
        category,
      };
      if (editing) return updateMenuItem(editing.id, payload);
      return createMenuItem(restaurantId, payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Dish updated." : "Dish added.");
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit dish" : "Add a dish"}</DialogTitle>
          <DialogDescription>Photos help customers order more.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            bucket="menu-images"
            label="Dish photo"
            value={imageUrl}
            onChange={setImageUrl}
          />
          <Field label="Dish name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Margherita Pizza"
            />
          </Field>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tomato, mozzarella, fresh basil"
            />
          </Field>
          <Field label="Section">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Menu section"
            >
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (PLN)">
            <Input
              type="number"
              min={0}
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {editing ? "Save changes" : "Add dish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
