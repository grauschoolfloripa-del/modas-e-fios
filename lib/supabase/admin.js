import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key — ignora RLS completamente.
 *
 * USO RESTRITO: só em código que roda no servidor (Route Handlers,
 * Server Actions), NUNCA em Client Components. É este cliente que
 * grava credenciais em app_settings, libera matrículas após o
 * webhook do Mercado Pago confirmar pagamento, etc.
 *
 * Se SUPABASE_SERVICE_ROLE_KEY não estiver configurada, retorna null
 * em vez de derrubar o build — quem chama decide como lidar com isso.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
