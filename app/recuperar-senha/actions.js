"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestReset(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Este recurso ainda não está configurado neste site." };
  }

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/conta`,
  });

  // Sempre retorna sucesso, mesmo se o e-mail não existir —
  // evita revelar quais e-mails têm conta cadastrada.
  return { success: true };
}
