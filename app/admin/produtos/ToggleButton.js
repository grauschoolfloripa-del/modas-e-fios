"use client";

import { useTransition } from "react";
import { togglePublished } from "./actions";

export default function ToggleButton({ id, published }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="link-arrow link-arrow--sm admin-toggle-btn"
      disabled={pending}
      onClick={() => startTransition(() => togglePublished(id, published))}
    >
      {published ? "Despublicar" : "Publicar"}
    </button>
  );
}
