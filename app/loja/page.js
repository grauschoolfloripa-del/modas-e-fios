import { getCatalogAsync } from "@/lib/catalog";
import CatalogGrid from "@/app/components/CatalogGrid";

export const metadata = {
  title: "Loja · Modas e Fios",
  description: "Peças de crochê feitas à mão pelo atelier Modas e Fios.",
};

export default async function LojaPage() {
  const produtos = await getCatalogAsync("produto");

  return (
    <CatalogGrid
      items={produtos}
      eyebrow="Loja"
      title="Peças em Crochê"
      emptyMessage="Nenhuma peça publicada ainda."
    />
  );
}
