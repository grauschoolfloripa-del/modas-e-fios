import Link from "next/link";
import { getCatalogAsync, formatPrice } from "@/lib/catalog";

export const metadata = {
  title: "Loja · Modas e Fios",
  description: "Peças de crochê feitas à mão e cursos do atelier Modas e Fios.",
};

export default async function LojaPage() {
  const catalog = await getCatalogAsync();

  return (
    <section className="products-section catalog-section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Loja</p>
          <h1 className="section-title">Peças &amp; Cursos</h1>
        </div>

        <div className="products-grid">
          {catalog.map((item) => (
            <Link
              key={item.slug}
              href={`/loja/${item.slug}`}
              className="product-card catalog-card"
            >
              <div
                className={`product-img ${item.coverImageUrl ? "" : item.coverClass}`}
                style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
              >
                {!item.coverImageUrl && <span className="product-emoji">{item.emoji}</span>}
                <span className="product-tag">{item.tagline}</span>
                {item.type === "curso" && (
                  <span className="catalog-type-badge">Curso</span>
                )}
              </div>
              <div className="product-info">
                <h4 className="product-name">{item.title}</h4>
                <p className="product-price">{formatPrice(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
