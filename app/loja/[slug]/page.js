import { notFound } from "next/navigation";
import { getAllSlugs, getBySlugAsync, formatPrice } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import WaitlistForm from "@/app/components/WaitlistForm";
import BuyButton from "@/app/components/BuyButton";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getBySlugAsync(slug);
  if (!item) return {};
  return {
    title: `${item.title} · Modas e Fios`,
    description: item.shortDescription,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const item = await getBySlugAsync(slug);
  if (!item) notFound();

  const isCourse = item.type === "curso";
  const mpConfigured = Boolean(await getSetting("mp_access_token"));

  return (
    <section className="contact catalog-detail">
      <div className="container contact-grid">
        <div className="contact-intro">
          {item.coverImageUrl && (
            <img src={item.coverImageUrl} alt={item.title} className="catalog-detail-cover" />
          )}
          <p className="eyebrow">{isCourse ? "Curso" : "Peça"} · {item.tagline}</p>
          <h1 className="contact-title">{item.title}</h1>
          <p className="contact-text catalog-detail-price">{formatPrice(item.price)}</p>

          {item.description.map((paragraph, i) => (
            <p className="contact-text" key={i}>{paragraph}</p>
          ))}

          {isCourse && (
            <p className="catalog-access-note">
              Acesso {item.accessType === "periodo" ? "por período" : "vitalício"} após a compra.
            </p>
          )}
        </div>

        <div>
          {mpConfigured ? (
            <BuyButton productSlug={item.slug} />
          ) : (
            <>
              <p className="catalog-form-intro">
                As vendas ainda não estão abertas. Deixe seu contato e avisamos assim que
                {isCourse ? " o curso" : " a peça"} estiver disponível para compra.
              </p>
              <WaitlistForm productSlug={item.slug} productTitle={item.title} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
