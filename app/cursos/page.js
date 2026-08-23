import { getCatalogAsync } from "@/lib/catalog";
import CatalogGrid from "@/app/components/CatalogGrid";

export const metadata = {
  title: "Cursos · Modas e Fios",
  description: "Cursos de crochê do atelier Modas e Fios — aprenda no seu ritmo, com vídeo completo para baixar.",
};

export default async function CursosPage() {
  const cursos = await getCatalogAsync("curso");

  return (
    <CatalogGrid
      items={cursos}
      eyebrow="Aprenda o Ofício"
      title="Nossos Cursos"
      emptyMessage="Nenhum curso publicado ainda."
    />
  );
}
