import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para Server Components / Route Handlers / Server Actions.
 * Usa a chave anônima — respeita RLS normalmente (age "como o usuário logado").
 *
 * Retorna null se as variáveis de ambiente do Supabase ainda não foram
 * configuradas, para que as páginas mostrem uma mensagem clara em vez de
 * quebrar com um erro genérico.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // chamado de um Server Component sem permissão de escrita —
          // o middleware cuida de manter a sessão atualizada nesse caso.
        }
      },
    },
  });
}
