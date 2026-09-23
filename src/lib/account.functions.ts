import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * GDPR account erasure: anonymizes the member's personal data (keeping order
 * history intact for the vendor / driver / accounting side), removes their
 * uploaded files, then deletes the auth user and signs them out.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { confirm: string }) => {
    if (input?.confirm !== "DELETE") throw new Error("Confirmation text does not match");
    return input;
  })
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Remove uploaded personal files (best effort).
    for (const bucket of ["profile-photos", "driver-documents", "chat-uploads"]) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list(userId, { limit: 100 });
      if (files?.length) {
        await supabaseAdmin.storage
          .from(bucket)
          .remove(files.map((f) => `${userId}/${f.name}`));
      }
    }

    // 2. Anonymize personal data while preserving historical records.
    const { error: rpcError } = await supabaseAdmin.rpc("anonymize_account", {
      _user_id: userId,
    });
    if (rpcError) throw new Error(rpcError.message);

    // 3. Delete the login itself.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
