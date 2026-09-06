import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/dobra/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { myDriverQuery } from "@/lib/dobra";
import {
  DOCS_STATUS_LABEL,
  DOC_TYPES,
  VEHICLE_TYPES,
  driverDocsQuery,
  removeDriverDocument,
  saveDriverDocument,
  saveVehicle,
  submitDriverApplication,
  type DocType,
} from "@/lib/driver-docs";

export const Route = createFileRoute("/_authenticated/driver/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Dobra for drivers" },
      { name: "description", content: "Upload your licence, ID and insurance to get approved." },
      { property: "og:title", content: "Documents — Dobra for drivers" },
      {
        property: "og:description",
        content: "Upload your licence, ID and insurance to get approved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverDocuments,
});

function DriverDocuments() {
  const queryClient = useQueryClient();
  const { data: driver } = useQuery(myDriverQuery);
  const { data: docs = [], isLoading } = useQuery(driverDocsQuery);

  const [vehicleType, setVehicleType] = useState("Bicycle");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    if (!driver) return;
    const d = driver as Record<string, unknown>;
    setVehicleType((d["vehicle_type"] as string) ?? "Bicycle");
    setVehicleModel((d["vehicle_model"] as string) ?? "");
    setPlate((d["plate"] as string) ?? "");
  }, [driver]);

  const docsStatus = ((driver as Record<string, unknown>)?.["docs_status"] as string) ?? "draft";

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["driver-documents"] });
    queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
  };

  const saveDetails = useMutation({
    mutationFn: () =>
      saveVehicle({
        vehicle_type: vehicleType,
        vehicle_model: vehicleModel.trim() || null,
        plate: plate.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Vehicle details saved.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: ({ docType, path }: { docType: DocType; path: string }) =>
      saveDriverDocument(docType, path, null),
    onSuccess: () => {
      toast.success("Document uploaded.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeDriverDocument(id),
    onSuccess: () => {
      toast.success("Document removed.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: submitDriverApplication,
    onSuccess: () => {
      toast.success("Sent for review — we will let you know shortly.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const docFor = (id: string) => docs.find((d) => d.doc_type === id);
  const requiredMissing = DOC_TYPES.filter((t) => t.required && !docFor(t.id));

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <Badge variant={docsStatus === "approved" ? "default" : "secondary"}>
          {DOCS_STATUS_LABEL[docsStatus] ?? docsStatus}
        </Badge>
      </div>

      <Card className="border-ink/10">
        <CardContent className="space-y-4 py-4">
          <h2 className="text-lg font-bold text-foreground">Your vehicle</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-type">Type</Label>
              <select
                id="vehicle-type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-model">Make and model</Label>
              <Input
                id="vehicle-model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Honda PCX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plate">Number plate</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="WX 12345"
              />
            </div>
          </div>
          <Button size="sm" disabled={saveDetails.isPending} onClick={() => saveDetails.mutate()}>
            Save vehicle details
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Your paperwork</h2>
        {isLoading ? <p className="text-sm text-foreground/60">Loading…</p> : null}
        {DOC_TYPES.map((type) => {
          const doc = docFor(type.id);
          return (
            <Card key={type.id} className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {type.label}
                      {type.required ? "" : " (if you drive)"}
                    </p>
                    <p className="text-xs text-foreground/60">{type.hint}</p>
                    {doc?.review_note ? (
                      <p className="text-xs text-destructive">{doc.review_note}</p>
                    ) : null}
                  </div>
                  {doc ? (
                    <div className="flex items-center gap-2">
                      <StatusIcon status={doc.status} />
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove ${type.label}`}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(doc.id)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <ImageUpload
                  bucket="driver-documents"
                  label={doc ? "Replace photo" : "Upload photo"}
                  value={doc?.file_path ?? null}
                  onChange={(path) => {
                    if (path) upload.mutate({ docType: type.id, path });
                  }}
                />
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-ink/10 bg-primary/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm text-foreground">
            {docsStatus === "approved"
              ? "You are approved to deliver with Dobra."
              : requiredMissing.length > 0
                ? `Still needed: ${requiredMissing.map((t) => t.label).join(", ")}.`
                : "Everything is uploaded — send it in for review."}
          </p>
          <Button
            disabled={submit.isPending || requiredMissing.length > 0 || docsStatus === "approved"}
            onClick={() => submit.mutate()}
          >
            Submit for review
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-foreground">
        <CheckCircle2 className="size-4" aria-hidden /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <XCircle className="size-4" aria-hidden /> Needs changes
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
      <Clock className="size-4" aria-hidden /> In review
    </span>
  );
}
