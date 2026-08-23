import Link from "next/link";
import { formatPrice } from "@/lib/catalog";

const BENEFITS = [
  { icon: "🎥", text: "Vídeo completo, seu para sempre — assista quantas vezes precisar" },
  { icon: "📥", text: "Baixe e leve com você — funciona até sem internet" },
  { icon: "🧶", text: "Do zero ao ponto alto, sem pular etapas" },
  { icon: "💛", text: "Ensinado por quem vive de crochê, todos os dias" },
];

const CURRICULUM = [
  "Como escolher fio e agulha certos para iniciantes",
  "Ponto baixo, ponto alto e correntinha",
  "Leitura de gráficos de crochê",
  "Passo a passo da sua primeira peça, do início ao fim",
];

export default function CourseSection({ course }) {
  if (!course) return null;
  const accessLabel = course.accessType === "periodo" ? "acesso por período" : "acesso vitalício";

  return (
    <section className="course-promo" id="curso">
      <div className="container course-promo-grid">
        <div className="course-promo-media">
          {course.coverImageUrl ? (
            <img src={course.coverImageUrl} alt={course.title} />
          ) : (
            <div className={`course-promo-fallback ${course.coverClass || "product-img--tote"}`}>
              <span>{course.emoji}</span>
            </div>
          )}
          <span className="course-promo-badge">Curso Online</span>
        </div>

        <div className="course-promo-body">
          <p className="eyebrow">Aprenda o Ofício</p>
          <h2 className="course-promo-title">
            Do primeiro nó<br /><em>à sua primeira peça</em>
          </h2>
          <p className="course-promo-lead">
            Sem experiência? Sem problema. Este curso foi feito pra quem nunca pegou
            um fio de crochê na vida.
          </p>
          <p className="course-promo-text">
            Muita gente desiste do crochê logo nas primeiras carreiras — não por falta
            de talento, mas por falta de um caminho claro. Aqui você aprende cada ponto
            no seu ritmo, revendo a aula quantas vezes precisar, até sentir a técnica
            nas mãos.
          </p>

          <ul className="course-promo-benefits">
            {BENEFITS.map((b) => (
              <li key={b.text}>
                <span className="course-promo-icon">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>

          <div className="course-promo-curriculum">
            <p className="course-promo-curriculum-title">O que você vai aprender</p>
            <ul>
              {CURRICULUM.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="course-promo-cta">
            <div>
              <p className="course-promo-price">{formatPrice(course.price)}</p>
              <p className="course-promo-access">{accessLabel} · pagamento único</p>
            </div>
            <Link href={`/loja/${course.slug}`} className="btn btn-solid">
              Quero Aprender
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
