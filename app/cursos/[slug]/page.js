import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default async function CursoPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cursos/${slug}`);

  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, cover_image_url")
    .eq("slug", slug)
    .eq("type", "curso")
    .single();
  if (!product) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle();

  const expired = enrollment?.expires_at && new Date(enrollment.expires_at) < new Date();
  if (!enrollment || expired) redirect(`/loja/${slug}`);

  const { data: files } = await supabase
    .from("product_files")
    .select("id, title, file_size_bytes")
    .eq("product_id", product.id)
    .order("created_at");

  return (
    <section className="contact course-player">
      <div className="container">
        <div className="section-head account-head">
          <p className="eyebrow">Meu curso</p>
          <h1 className="section-title">{product.title}</h1>
        </div>

        {product.cover_image_url && (
          <img src={product.cover_image_url} alt="" className="course-cover" />
        )}

        {product.description && <p className="contact-text">{product.description}</p>}

        <h3>Arquivos para download</h3>
        {files && files.length > 0 ? (
          <ul className="course-download-list">
            {files.map((f) => (
              <li key={f.id}>
                <div>
                  <span className="course-download-title">{f.title}</span>
                  <span className="course-download-size">{formatBytes(f.file_size_bytes)}</span>
                </div>
                <a href={`/api/download/${f.id}`} className="btn btn-outline btn-sm">
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="contact-text">
            O conteúdo deste curso ainda está em produção — os arquivos aparecem aqui assim
            que forem publicados. Você já garantiu seu acesso. 🤍
          </p>
        )}
      </div>
    </section>
  );
}
