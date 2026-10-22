import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionDialog } from "@/components/admin/ActionDialog";
import { customerReviewsQuery, removeReview } from "@/lib/admin-ops";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: Feedback,
});

function Feedback() {
  const { formatDate } = useI18n();
  const qc = useQueryClient();
  const { data, isPending } = useQuery(customerReviewsQuery);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Customer reviews</h1>
        <p className="text-sm text-foreground/60">Remove reviews that are abusive, fake or off-topic. The restaurant rating updates automatically.</p>
      </div>
      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      {!isPending && !(data ?? []).length ? <Card className="p-8 text-center text-foreground/60">No reviews yet.</Card> : null}
      <div className="space-y-2">
        {(data ?? []).map((r) => (
          <Card key={r.id} className="admin-record-header flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-semibold">
                {r.restaurantName} · {"★".repeat(r.restaurant_rating)}
                {r.driver_rating ? <span className="ml-2 text-sm text-foreground/60">driver {r.driver_rating}★</span> : null}
              </p>
              <p className="break-words text-sm">{r.comment || <span className="text-foreground/50">No comment</span>}</p>
              <p className="text-xs text-foreground/50">
                {r.customerName} · {formatDate(r.created_at)}
              </p>
            </div>
            <ActionDialog
              trigger={<Button size="sm" variant="destructive">Remove</Button>}
              title="Remove this review?"
              reasonLabel="Reason"
              reasonRequired
              destructive
              confirmLabel="Remove review"
              successMessage="Review removed"
              onConfirm={async (reason) => {
                await removeReview(r.id, reason);
                qc.invalidateQueries({ queryKey: ["admin"] });
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
