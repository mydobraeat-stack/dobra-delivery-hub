import { useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { useI18n, useT } from "@/lib/i18n";
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

const NEXT_LABEL_KEY: Record<string, string> = {
  pending: "vendor.items.acceptOrder",
  accepted: "vendor.items.startPreparing",
  preparing: "vendor.items.markReady",
};

export const EMPTY_RESTAURANT: RestaurantInput = {
  name: "",
  cuisine: "",
  city: "",
  address_line: "",
  postal_code: "",
  country: "Poland",
  eta_minutes: 30,
  delivery_fee: 5,
  min_order: 0,
  logo_url: null,
};

/* ---------- selected restaurant, shared across vendor pages ---------- */

const SELECTED_KEY = "dobra.vendor.restaurant";
let selectedId: string | null = null;
const listeners = new Set<() => void>();

function readSelected() {
  if (selectedId === null && typeof window !== "undefined") {
    selectedId = window.localStorage.getItem(SELECTED_KEY);
  }
  return selectedId;
}

export function setSelectedRestaurant(id: string) {
  selectedId = id;
  if (typeof window !== "undefined") window.localStorage.setItem(SELECTED_KEY, id);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useVendorRestaurant() {
  const stored = useSyncExternalStore(
    subscribe,
    () => readSelected(),
    () => null,
  );
  const { data: restaurants = [], isLoading } = useQuery(vendorRestaurantsQuery);
  const restaurantId =
    (stored && restaurants.some((r) => r.id === stored) ? stored : null) ?? restaurants[0]?.id;

  const { data: detail } = useQuery({
    ...restaurantQuery(restaurantId ?? ""),
    enabled: Boolean(restaurantId),
  });

  return {
    restaurants,
    isLoading,
    restaurantId: restaurantId as string | undefined,
    restaurant: detail?.restaurant ?? null,
    items: detail?.items ?? [],
  };
}

export function useVendorOrders(restaurantId: string | undefined) {
  return useQuery(vendorOrdersQuery(restaurantId));
}

/* ---------- shared pieces ---------- */

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-ink/10">
      <CardContent className="py-4">
        <p className="text-xs text-foreground/60">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export function RestaurantSwitcher() {
  const { restaurants, restaurantId } = useVendorRestaurant();
  if (restaurants.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {restaurants.map((r) => (
        <Button
          key={r.id}
          size="sm"
          variant={r.id === restaurantId ? "default" : "outline"}
          onClick={() => setSelectedRestaurant(r.id)}
        >
          {r.name}
        </Button>
      ))}
    </div>
  );
}

export function OrdersSection({
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
  const t = useT();
  const { formatMoney, formatDate } = useI18n();
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
      toast.success(t("vendor.items.orderCancelled"));
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
          const labelKey = NEXT_LABEL_KEY[o.status];
          const isOpen = expanded === o.id;
          return (
            <Card key={o.id} className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{orderRef(o.id)}</p>
                    <p className="text-xs text-foreground/60">
                      {money(o.total, o.currency)} ·{" "}
                      {formatDate(o.created_at, {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {o.address ? (
                      <p className="text-xs text-foreground/60">
                        {t("vendor.items.dropOff", { address: o.address })}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.status} />
                    <ChatButton
                      kind="order_vendor"
                      orderId={o.id}
                      label={t("chat.messageCustomer")}
                    />
                    {actionable && labelKey && next ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: next })}
                      >
                        {t(labelKey)}
                      </Button>
                    ) : null}
                    {actionable &&
                    ["pending", "accepted", "preparing", "ready"].includes(o.status) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={cancel.isPending}
                        onClick={() => cancel.mutate(o.id)}
                      >
                        {t("vendor.items.cancel")}
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
                      {t("vendor.items.itemsButton")}
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
  const t = useT();
  const { data = [], isLoading } = useQuery(orderItemsQuery(orderId));

  if (isLoading) return <p className="text-xs text-foreground/60">{t("vendor.items.loadingItems")}</p>;
  if (data.length === 0)
    return <p className="text-xs text-foreground/60">{t("vendor.items.noItemsRecorded")}</p>;

  return (
    <ul className="space-y-1 border-t border-ink/10 pt-3">
      {data.map((row: any) => (
        <li key={row.id} className="flex justify-between text-sm text-foreground/80">
          <span>
            {row.quantity}× {row.menu_items?.name ?? t("vendor.items.item")}
          </span>
          <span>{money(Number(row.price) * Number(row.quantity), currency)}</span>
        </li>
      ))}
    </ul>
  );
}

export function MenuSection({
  items,
  onAdd,
  onEdit,
}: {
  items: MenuItem[];
  onAdd: () => void;
  onEdit: (item: MenuItem) => void;
}) {
  const t = useT();
  const { formatMoney } = useI18n();
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
      toast.success(t("vendor.menuSection.dishRemoved"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">{t("vendor.menuSection.title")}</h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-4" aria-hidden /> {t("vendor.menuSection.addDish")}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/60">{t("vendor.menuSection.empty")}</p>
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
                <p className="text-sm text-foreground/70">{formatMoney(item.price, item.currency)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/60">
                  {item.available ? t("vendor.menuSection.available") : t("vendor.menuSection.hidden")}
                </span>
                <Switch
                  checked={item.available}
                  aria-label={t("vendor.menuSection.toggleAvailability", { name: item.name })}
                  onCheckedChange={(checked) => toggle.mutate({ id: item.id, available: checked })}
                />
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  {t("vendor.menuSection.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={t("vendor.menuSection.delete", { name: item.name })}
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

export function RestaurantDialog({
  open,
  editing,
  onOpenChange,
}: {
  open: boolean;
  editing: Restaurant | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
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
            address_line: editing.address_line ?? "",
            postal_code: editing.postal_code ?? "",
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
      if (!form.name.trim()) throw new Error(t("vendor.restaurantDialog.nameRequired"));
      if (editing) {
        await updateRestaurant(editing.id, form);
        return editing.id;
      }
      return createRestaurant(form);
    },
    onSuccess: (id) => {
      toast.success(editing ? t("vendor.restaurantDialog.updated") : t("vendor.restaurantDialog.created"));
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      if (!editing) setSelectedRestaurant(id);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("vendor.restaurantDialog.editTitle") : t("vendor.restaurantDialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? t("vendor.restaurantDialog.editDescription")
              : t("vendor.restaurantDialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            bucket="restaurant-logos"
            label={t("vendor.restaurantDialog.photoLabel")}
            value={form.logo_url}
            onChange={(logo_url) => setForm((f) => ({ ...f, logo_url }))}
          />
          <Field label={t("vendor.restaurantDialog.nameLabel")}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("vendor.restaurantDialog.namePlaceholder")}
            />
          </Field>
          <Field label={t("vendor.restaurantDialog.cuisineLabel")}>
            <Input
              value={form.cuisine}
              onChange={(e) => setForm((f) => ({ ...f, cuisine: e.target.value }))}
              placeholder={t("vendor.restaurantDialog.cuisinePlaceholder")}
            />
          </Field>
          <Field label={t("vendor.restaurantDialog.addressLabel")}>
            <Input
              value={form.address_line}
              onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
              placeholder={t("vendor.restaurantDialog.addressPlaceholder")}
              autoComplete="street-address"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("vendor.restaurantDialog.postalLabel")}>
              <Input
                value={form.postal_code}
                onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                placeholder={t("vendor.restaurantDialog.postalPlaceholder")}
                autoComplete="postal-code"
              />
            </Field>
            <Field label={t("vendor.restaurantDialog.cityLabel")}>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder={t("vendor.restaurantDialog.cityPlaceholder")}
              />
            </Field>
            <Field label={t("vendor.restaurantDialog.countryLabel")}>
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </Field>
            <Field label={t("vendor.restaurantDialog.etaLabel")}>
              <Input
                type="number"
                min={5}
                value={form.eta_minutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eta_minutes: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label={t("vendor.restaurantDialog.deliveryFeeLabel")}>
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
            <Field label={t("vendor.restaurantDialog.minOrderLabel")}>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.min_order}
                onChange={(e) => setForm((f) => ({ ...f, min_order: Number(e.target.value) || 0 }))}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("vendor.restaurantDialog.cancel")}
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {editing ? t("vendor.restaurantDialog.saveChanges") : t("vendor.restaurantDialog.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DishDialog({
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
  const t = useT();
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
      if (!name.trim()) throw new Error(t("vendor.dishDialog.nameRequired"));
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
      toast.success(t(editing ? "vendor.dishDialog.updated" : "vendor.dishDialog.created"));
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
          <DialogTitle>{t(editing ? "vendor.dishDialog.editTitle" : "vendor.dishDialog.createTitle")}</DialogTitle>
          <DialogDescription>{t("vendor.dishDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            bucket="menu-images"
            label={t("vendor.dishDialog.photoLabel")}
            value={imageUrl}
            onChange={setImageUrl}
          />
          <Field label={t("vendor.dishDialog.nameLabel")}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("vendor.dishDialog.namePlaceholder")}
            />
          </Field>
          <Field label={t("vendor.dishDialog.descriptionLabel")}>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("vendor.dishDialog.descriptionPlaceholder")}
            />
          </Field>
          <Field label={t("vendor.dishDialog.sectionLabel")}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label={t("vendor.dishDialog.sectionAria")}
            >
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`common.categories.${c}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("vendor.dishDialog.priceLabel")}>
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
            {t("vendor.dishDialog.cancel")}
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {t(editing ? "vendor.dishDialog.saveChanges" : "vendor.dishDialog.addButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
