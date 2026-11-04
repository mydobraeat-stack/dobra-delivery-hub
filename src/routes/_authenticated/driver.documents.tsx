import { DriverPhoneCard } from "@/components/dobra/DriverPhoneCard";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { ListSkeleton } from "@/components/dobra/QueryStates";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/dobra/ImageUpload";
import { DocExamples } from "@/components/dobra/DocExamples";
import bagGood from "@/assets/doc-bag-good.jpg";
import bagAvoid from "@/assets/doc-bag-avoid.jpg";
import selfieGood from "@/assets/doc-selfie-good.jpg";
import selfieAvoid from "@/assets/doc-selfie-avoid.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { myProfileQuery } from "@/lib/my-profile";
import { myDriverQuery } from "@/lib/dobra";
import { useT } from "@/lib/i18n";
import {
  DOCS_STATUS_LABEL_KEY,
  requiredDocsFor,
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
  const t = useT();
  const { data: driver } = useQuery(myDriverQuery);
  const { data: docs = [], isLoading } = useQuery(driverDocsQuery);

  const [vehicleType, setVehicleType] = useState("Bicycle");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plate, setPlate] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { data: profile } = useQuery(myProfileQuery);

  useEffect(() => {
    if (!driver) return;
    const d = driver as Record<string, unknown>;
    setVehicleType((d["vehicle_type"] as string) ?? "Bicycle");
    setVehicleModel((d["vehicle_model"] as string) ?? "");
    setPlate((d["plate"] as string) ?? "");
  }, [driver]);

  const docsStatus = ((driver as Record<string, unknown>)?.["docs_status"] as string) ?? "draft";
  const locked = docsStatus === "in_review" || docsStatus === "approved";

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
      toast.success(t("driver.documents.savedToast"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: ({ docType, path }: { docType: DocType; path: string }) =>
      saveDriverDocument(docType, path, null),
    onSuccess: () => {
      toast.success(t("driver.documents.uploadedToast"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeDriverDocument(id),
    onSuccess: () => {
      toast.success(t("driver.documents.removedToast"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: () => submitDriverApplication(acceptTerms),
    onSuccess: () => {
      toast.success(t("driver.documents.submittedToast"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const docFor = (id: string) => docs.find((d) => d.doc_type === id);
  const requiredDocs = requiredDocsFor(vehicleType);
  const requiredMissing = requiredDocs.filter((d) => !docFor(d.id) || docFor(d.id)?.status === "rejected");

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{t("driver.documents.title")}</h1>
        <Badge variant={docsStatus === "approved" ? "default" : "secondary"}>
          {t(DOCS_STATUS_LABEL_KEY[docsStatus] ?? "driver.documents.status.draft")}
        </Badge>
      </div>

      <DriverPhoneCard />

      <Card className="border-ink/10">
        <CardContent className="space-y-4 py-4">
          <h2 className="text-lg font-bold text-foreground">{t("driver.documents.vehicleTitle")}</h2>
          {locked ? <p className="text-sm text-foreground/80">{t("driver.application.locked")}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-type">{t("driver.documents.type")}</Label>
              <select
                id="vehicle-type"
                disabled={locked}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {t(`driver.vehicleTypes.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-model">{t("driver.documents.makeModel")}</Label>
              <Input
                id="vehicle-model"
                disabled={locked}
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Honda PCX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plate">{t("driver.documents.plate")}</Label>
              <Input
                id="plate"
                disabled={locked}
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="WX 12345"
              />
            </div>
          </div>
          <Button size="sm" disabled={saveDetails.isPending || locked} onClick={() => saveDetails.mutate()}>
            {t("driver.documents.save")}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.documents.paperworkTitle")}</h2>
        {isLoading ? <ListSkeleton rows={3} /> : null}
        {requiredDocs.map((type) => {
          const doc = docFor(type.id);
          const capture =
            type.id === "profile_photo"
              ? ("user" as const)
              : type.id === "id_card"
                ? ("environment" as const)
                : undefined;
          return (
            <Card key={type.id} className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{t(type.labelKey)}</p>
                    <p className="text-xs text-foreground/60">{t(type.hintKey)}</p>
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
                        aria-label={t("driver.documents.removeAria", { label: t(type.labelKey) })}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(doc.id)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </div>
                {type.id === "insulated_bag" ? (
                  <DocExamples good={bagGood} avoid={bagAvoid} />
                ) : null}
                {type.id === "profile_photo" ? (
                  <DocExamples good={selfieGood} avoid={selfieAvoid} />
                ) : null}
                <ImageUpload
                  bucket="driver-documents"
                  capture={capture}
                  label={t(doc ? "driver.documents.replacePhoto" : "driver.documents.uploadPhoto")}
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

      <Card className="border-ink/10 bg-sun/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex w-full items-start gap-3"><Checkbox id="driver-terms" checked={acceptTerms} onCheckedChange={v => setAcceptTerms(v === true)} /><Label htmlFor="driver-terms" className="block text-sm">{t("driver.application.terms")} <Link to="/terms" target="_blank" className="text-brand underline">{t("driver.application.termsLink")}</Link></Label></div>
          <p className="text-sm text-foreground">
            {docsStatus === "approved"
              ? t("driver.documents.approvedNote")
              : requiredMissing.length > 0
                ? t("driver.documents.missingNote", {
                    items: requiredMissing.map((d) => t(d.labelKey)).join(", "),
                  })
                : t("driver.documents.allUploadedNote")}
          </p>
          <Button
            disabled={submit.isPending || requiredMissing.length > 0 || !acceptTerms || !profile?.phone || locked}
            onClick={() => submit.mutate()}
          >
            {t("driver.documents.submit")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusIcon({ status }: { status: string }) {
  const t = useT();
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-foreground">
        <CheckCircle2 className="size-4" aria-hidden /> {t("driver.documents.approvedIcon")}
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <XCircle className="size-4" aria-hidden /> {t("driver.documents.rejectedIcon")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
      <Clock className="size-4" aria-hidden /> {t("driver.documents.reviewIcon")}
    </span>
  );
}
