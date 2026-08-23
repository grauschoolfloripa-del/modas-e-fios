"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setSetting, getSetting } from "@/lib/settings";

async function requireAdminUser() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Sem permissão.");
  return user;
}

export async function saveMercadoPagoSettings(prevState, formData) {
  let user;
  try {
    user = await requireAdminUser();
  } catch (e) {
    return { error: e.message };
  }

  const fields = [
    ["mp_access_token", formData.get("mpAccessToken")],
    ["mp_public_key", formData.get("mpPublicKey")],
    ["mp_webhook_secret", formData.get("mpWebhookSecret")],
  ];

  try {
    for (const [key, rawValue] of fields) {
      const value = typeof rawValue === "string" ? rawValue.trim() : "";
      if (!value) continue; // campo em branco = mantém o valor já salvo
      await setSetting(key, value, user.id, true);
    }
  } catch (e) {
    return { error: "Não foi possível salvar. Verifique a conexão com o Supabase." };
  }

  revalidatePath("/admin/configuracoes");
  return { success: true };
}

export async function testMercadoPagoConnection() {
  const accessToken = await getSetting("mp_access_token");
  if (!accessToken) return { error: "Nenhum Access Token salvo ainda." };

  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { error: "Token inválido ou expirado." };
    const data = await res.json();
    return { success: true, accountEmail: data.email, siteId: data.site_id };
  } catch {
    return { error: "Falha ao conectar com o Mercado Pago." };
  }
}
