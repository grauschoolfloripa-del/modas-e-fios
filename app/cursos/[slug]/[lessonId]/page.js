import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonActions from "./LessonActions";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cursos/${slug}/${lessonId}`);

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, video_url, module_id, modules(product_id, products(slug, title))")
    .eq("id", lessonId)
    .single();

  if (!lesson || lesson.modules?.products?.slug !== slug) notFound();

  const { data: progress } = await supabase
    .from("progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return (
    <section className="contact course-player">
      <div className="container">
        <Link href={`/cursos/${slug}`} className="link-arrow link-arrow--sm">← Voltar ao curso</Link>
        <h1 className="section-title" style={{ margin: "16px 0 24px" }}>{lesson.title}</h1>

        {lesson.video_url ? (
          <video className="course-lesson-video" src={lesson.video_url} controls playsInline />
        ) : (
          <p className="contact-text">Vídeo desta aula ainda não foi publicado.</p>
        )}

        <div style={{ marginTop: "24px" }}>
          <LessonActions lessonId={lesson.id} completed={progress?.completed || false} />
        </div>
      </div>
    </section>
  );
}
