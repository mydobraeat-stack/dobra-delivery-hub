import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ImageBucket = "restaurant-logos" | "menu-images" | "profile-photos";

function isDirectUrl(value: string) {
  return value.startsWith("/") || value.startsWith("http");
}

/** Uploads a file to a private bucket under the signed-in user's folder and returns `bucket/path`. */
export async function uploadImage(bucket: ImageBucket, file: File) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Not signed in");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return `${bucket}/${path}`;
}

export async function resolveImageUrl(value: string) {
  if (isDirectUrl(value)) return value;
  const [bucket, ...rest] = value.split("/");
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(rest.join("/"), 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

/** Resolves a stored image reference (plain URL or `bucket/path`) into a displayable URL. */
export function useImageUrl(value: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["image-url", value],
    enabled: Boolean(value) && !isDirectUrl(value!),
    staleTime: 45 * 60 * 1000,
    queryFn: () => resolveImageUrl(value!),
  });

  if (!value) return null;
  return isDirectUrl(value) ? value : (data ?? null);
}
