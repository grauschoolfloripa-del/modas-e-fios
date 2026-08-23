import Link from "next/link";
import { formatPrice } from "@/lib/catalog";

export default function CatalogGrid({ items, eyebrow, title, emptyMessage }) {
  return (
    <section className="products-section catalog-section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
        </div>

        {items.length === 0 ? (
          <p className="contact-text" style={{ textAlign: "center" }}>{emptyMessage}</p>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
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
        )}
      </div>
    </section>
  );
}
