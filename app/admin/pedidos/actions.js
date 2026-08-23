"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Sem permissão.");
  return supabase;
}

export async function updateFulfillment(orderId, fulfillmentStatus, trackingCode) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("orders")
    .update({
      fulfillment_status: fulfillmentStatus,
      tracking_code: trackingCode || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  revalidatePath("/admin/pedidos");
  revalidatePath("/conta");
  if (error) return { error: "Não foi possível atualizar." };
  return { success: true };
}
