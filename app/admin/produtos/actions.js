"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Sem permissão.");
  return { supabase, userId: user.id };
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
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch (e) {
    return { error: e.message };
  }
  const { supabase } = ctx;

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
  const saleMode = String(formData.get("saleMode") || "venda");
  const coverImageFile = formData.get("coverImage");

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
    sale_mode: saleMode,
    published,
    updated_at: new Date().toISOString(),
  };

  // upload da capa, se uma imagem nova foi selecionada
  if (coverImageFile && coverImageFile.size > 0) {
    const admin = createAdminClient();
    if (!admin) return { error: "Erro interno de configuração (storage)." };

    if (coverImageFile.size > 8 * 1024 * 1024) {
      return { error: "A imagem de capa deve ter até 8MB." };
    }

    const ext = (coverImageFile.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${slug}-${Date.now()}.${ext}`;
    const bytes = await coverImageFile.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("product-covers")
      .upload(path, bytes, { contentType: coverImageFile.type, upsert: false });

    if (uploadError) {
      return { error: "Falha ao enviar a imagem de capa." };
    }

    const { data: pub } = admin.storage.from("product-covers").getPublicUrl(path);
    payload.cover_image_url = pub.publicUrl;
  }

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
  const { supabase } = await requireAdmin();
  await supabase.from("products").update({ published: !published }).eq("id", id);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}

/**
 * Fluxo de upload de arquivo de curso (vídeo completo, materiais):
 * o navegador do admin envia o arquivo DIRETO pro Supabase Storage,
 * sem passar pelo servidor do site — evita limite de tamanho da Vercel.
 *
 * 1. createUploadTarget()  -> gera uma URL assinada de upload
 * 2. o navegador faz o upload direto para essa URL
 * 3. confirmFileUpload()   -> registra o arquivo na tabela product_files
 */
export async function createUploadTarget(productId, fileName) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Erro interno de configuração (storage)." };

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${productId}/${Date.now()}-${safeName}`;

  const { data, error } = await admin.storage.from("course-files").createSignedUploadUrl(path);
  if (error) return { error: "Não foi possível iniciar o envio." };

  return { signedUrl: data.signedUrl, token: data.token, path };
}

export async function confirmFileUpload(productId, path, title, sizeBytes, contentType) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("product_files")
    .insert({
      product_id: productId,
      title,
      storage_path: path,
      file_size_bytes: sizeBytes,
      content_type: contentType,
    })
    .select("id")
    .single();
  if (error) return { error: "Falha ao registrar o arquivo." };

  revalidatePath(`/admin/produtos/${productId}`);
  return { success: true, id: data.id };
}

export async function deleteProductFile(fileId, productId) {
  const { supabase } = await requireAdmin();
  const admin = createAdminClient();

  const { data: file } = await supabase
    .from("product_files")
    .select("storage_path")
    .eq("id", fileId)
    .single();

  if (file && admin) {
    await admin.storage.from("course-files").remove([file.storage_path]);
  }
  await supabase.from("product_files").delete().eq("id", fileId);

  revalidatePath(`/admin/produtos/${productId}`);
}
