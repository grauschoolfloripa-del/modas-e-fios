"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLessonComplete } from "../actions";

export default function LessonActions({ lessonId, completed }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleLessonComplete(lessonId, completed);
          router.refresh();
        })
      }
    >
      {completed ? "Marcada como concluída ✓" : "Marcar como concluída"}
    </button>
  );
}
