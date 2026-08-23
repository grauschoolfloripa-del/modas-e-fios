import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura/escrita de app_settings (credenciais como Mercado Pago).
 *
 * SERVER-ONLY: usa a service role key, que ignora RLS. Nunca importe
 * este arquivo em um componente "use client" — só em Server Components,
 * Route Handlers ou Server Actions.
 */

export async function getSetting(key) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("app_settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function getSettingsStatus(keys) {
  const admin = createAdminClient();
  const status = {};
  keys.forEach((k) => (status[k] = false));
  if (!admin) return status;

  const { data } = await admin.from("app_settings").select("key, value").in("key", keys);
  (data || []).forEach((row) => {
    status[row.key] = Boolean(row.value && row.value.trim().length > 0);
  });
  return status;
}

export async function setSetting(key, value, userId, isSecret = true) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase (service role) não configurado.");

  const { error } = await admin.from("app_settings").upsert({
    key,
    value,
    is_secret: isSecret,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  });
  if (error) throw error;
}
