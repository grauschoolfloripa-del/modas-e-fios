"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLessonComplete(lessonId, completed) {
  const supabase = await createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, completed: !completed, updated_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );

  revalidatePath("/cursos");
}
