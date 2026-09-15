import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DOC_TYPES = [
  { id: "profile_photo", labelKey: "driver.documents.types.profile_photo.label", hintKey: "driver.documents.types.profile_photo.hint", required: true },
  { id: "id_card", labelKey: "driver.documents.types.id_card.label", hintKey: "driver.documents.types.id_card.hint", required: true },
  { id: "drivers_licence", labelKey: "driver.documents.types.drivers_licence.label", hintKey: "driver.documents.types.drivers_licence.hint", required: true },
  { id: "insurance", labelKey: "driver.documents.types.insurance.label", hintKey: "driver.documents.types.insurance.hint", required: true },
  { id: "insulated_bag", labelKey: "driver.documents.types.insulated_bag.label", hintKey: "driver.documents.types.insulated_bag.hint", required: true },
  { id: "vehicle_photo", labelKey: "driver.documents.types.vehicle_photo.label", hintKey: "driver.documents.types.vehicle_photo.hint", required: true },
  {
    id: "vehicle_registration",
    labelKey: "driver.documents.types.vehicle_registration.label",
    hintKey: "driver.documents.types.vehicle_registration.hint",
    required: false,
  },
] as const;

export type DocType = (typeof DOC_TYPES)[number]["id"];

export const VEHICLE_TYPES = ["Bicycle", "E-bike", "Scooter", "Motorbike", "Car", "On foot"] as const;

export type DriverDocument = {
  id: string;
  doc_type: string;
  file_path: string;
  expires_on: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
};

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

export const driverDocsQuery = queryOptions({
  queryKey: ["driver-documents"],
  queryFn: async (): Promise<DriverDocument[]> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("driver_documents")
      .select("id, doc_type, file_path, expires_on, status, review_note, created_at")
      .eq("driver_id", userId)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as DriverDocument[];
  },
});

export async function saveDriverDocument(
  docType: DocType,
  filePath: string,
  expiresOn: string | null,
) {
  const driverId = await currentUserId();
  const { error } = await supabase.from("driver_documents").upsert(
    {
      driver_id: driverId,
      doc_type: docType,
      file_path: filePath,
      expires_on: expiresOn,
      status: "pending",
    },
    { onConflict: "driver_id,doc_type" },
  );
  if (error) throw error;
}

export async function removeDriverDocument(id: string) {
  const { error } = await supabase.from("driver_documents").delete().eq("id", id);
  if (error) throw error;
}

export type VehicleInput = {
  vehicle_type: string | null;
  vehicle_model: string | null;
  plate: string | null;
};

export async function saveVehicle(input: VehicleInput) {
  const id = await currentUserId();
  const { error } = await supabase.from("drivers").upsert({ id, ...input }, { onConflict: "id" });
  if (error) throw error;
}

export async function submitDriverApplication() {
  const id = await currentUserId();
  const { error } = await supabase
    .from("drivers")
    .upsert(
      { id, docs_status: "in_review", submitted_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (error) throw error;
}

export const DOCS_STATUS_LABEL_KEY: Record<string, string> = {
  draft: "driver.documents.status.draft",
  in_review: "driver.documents.status.in_review",
  approved: "driver.documents.status.approved",
  rejected: "driver.documents.status.rejected",
};
