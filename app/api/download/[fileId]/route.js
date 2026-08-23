import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Gera um link de download temporário (poucos minutos) para um arquivo
 * de curso. A checagem de acesso acontece na própria consulta: a RLS de
 * product_files só devolve a linha se o usuário tiver matrícula válida
 * (ou for admin) — se não devolver nada, não distinguimos "não existe"
 * de "sem acesso", para não dar pista a quem está tentando adivinhar ids.
 */
export async function GET(request, { params }) {
  const { fileId } = await params;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Não configurado." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/api/download/${fileId}`, request.url));

  const { data: file } = await supabase
    .from("product_files")
    .select("storage_path, title")
    .eq("id", fileId)
    .single();

  if (!file) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Erro interno." }, { status: 500 });

  const { data: signed, error } = await admin.storage
    .from("course-files")
    .createSignedUrl(file.storage_path, 300, { download: file.title });

  if (error || !signed) {
    return NextResponse.json({ error: "Não foi possível gerar o link de download." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
