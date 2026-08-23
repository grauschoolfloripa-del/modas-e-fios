import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getBySlug } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Grava no Supabase (tabela `waitlist`) quando configurado.
 * Sem Supabase ainda, cai para um arquivo local — só serve para
 * testar o fluxo em desenvolvimento, NÃO funciona em produção na Vercel
 * (sistema de arquivos lá é somente leitura e efêmero).
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveLocalFallback(entry) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let existing = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    existing = JSON.parse(raw);
  } catch {
    existing = [];
  }
  existing.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  const product = getBySlug(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  const admin = createAdminClient();

  try {
    if (admin) {
      const { error } = await admin.from("waitlist").insert({
        name,
        email,
        product_slug: productSlug,
      });
      if (error) throw error;
    } else {
      await saveLocalFallback({
        name,
        email,
        productSlug,
        productTitle: product.title,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Falha ao gravar lista de espera:", err);
    return NextResponse.json({ error: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
