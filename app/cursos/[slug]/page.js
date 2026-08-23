import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    .select("id, title, type")
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

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, position, lessons(id, title, position, duration_seconds)")
    .eq("product_id", product.id)
    .order("position");

  const { data: progressRows } = await supabase
    .from("progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id);
  const doneSet = new Set((progressRows || []).filter((p) => p.completed).map((p) => p.lesson_id));

  const hasLessons = modules && modules.some((m) => m.lessons?.length > 0);

  return (
    <section className="contact course-player">
      <div className="container">
        <div className="section-head account-head">
          <p className="eyebrow">Meu curso</p>
          <h1 className="section-title">{product.title}</h1>
        </div>

        {!hasLessons ? (
          <p className="contact-text">
            O conteúdo deste curso ainda está em produção — as aulas aparecem aqui assim
            que forem publicadas. Você já garantiu seu acesso. 🤍
          </p>
        ) : (
          (modules || []).map((mod) => (
            <div key={mod.id} className="course-module">
              <h3>{mod.title}</h3>
              <ul className="course-lesson-list">
                {(mod.lessons || [])
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => (
                    <li key={lesson.id}>
                      <Link href={`/cursos/${slug}/${lesson.id}`}>
                        <span className={doneSet.has(lesson.id) ? "course-lesson-done" : ""}>
                          {doneSet.has(lesson.id) ? "✓ " : ""}
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
