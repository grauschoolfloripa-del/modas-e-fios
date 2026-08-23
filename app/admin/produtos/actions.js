"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveProduct(prevState, formData) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: e.message };
  }

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  const type = String(formData.get("type") || "produto");
  const tagline = String(formData.get("tagline") || "").trim();
  const shortDescription = String(formData.get("shortDescription") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceReais = parseFloat(String(formData.get("price") || "0").replace(",", "."));
  const coverEmoji = String(formData.get("coverEmoji") || "🧶").trim();
  const accessType = type === "curso" ? String(formData.get("accessType") || "vitalicio") : null;
  const accessDurationDays =
    accessType === "periodo" ? parseInt(formData.get("accessDurationDays"), 10) || null : null;
  const published = formData.get("published") === "on";

  if (!title) return { error: "Informe o título." };
  if (!slug) slug = slugify(title);
  else slug = slugify(slug);
  if (!slug) return { error: "Slug inválido." };
  if (Number.isNaN(priceReais) || priceReais < 0) return { error: "Preço inválido." };

  const payload = {
    slug,
    type,
    title,
    tagline,
    short_description: shortDescription,
    description,
    price_cents: Math.round(priceReais * 100),
    cover_emoji: coverEmoji,
    cover_class: "product-img--tote",
    access_type: accessType,
    access_duration_days: accessDurationDays,
    published,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    ({ error } = await supabase.from("products").update(payload).eq("id", id));
  } else {
    ({ error } = await supabase.from("products").insert(payload));
  }

  if (error) {
    if (error.code === "23505") return { error: "Já existe um produto com este slug." };
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function togglePublished(id, published) {
  const supabase = await requireAdmin();
  await supabase.from("products").update({ published: !published }).eq("id", id);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}
