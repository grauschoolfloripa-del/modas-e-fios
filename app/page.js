import Link from "next/link";
import { getBySlugAsync } from "@/lib/catalog";
import HeroCine from "./components/HeroCine";
import YarnDivider from "./components/YarnDivider";
import CourseSection from "./components/CourseSection";
import ContactForm from "./components/ContactForm";

export default async function Home() {
  const course = await getBySlugAsync("curso-croche-iniciantes");

  return (
    <>
      <HeroCine />

      <YarnDivider />

      {/* ================= EDITORIAL — COLEÇÃO ================= */}
      <section className="editorial" id="colecao">
        <div className="editorial-media" aria-hidden="true"></div>
        <div className="editorial-overlay">
          <div className="editorial-card">
            <p className="eyebrow">Coleção Verão 25</p>
            <h2 className="editorial-title">A Ilha<br />Inspira</h2>
            <p className="editorial-text">
              Para essa temporada, o Modas e Fios apresenta peças que unem frescor e
              elegância — vestidos fluidos, blusas bordadas e conjuntos pensados para o
              calor e o ritmo de Floripa. Leveza na construção, precisão no caimento.
            </p>
            <div className="editorial-stats">
              <div><strong>100%</strong><span>Feito à mão</span></div>
              <div><strong>Sob medida</strong><span>Ou pronta entrega</span></div>
              <div><strong>Floripa</strong><span>Atelier local</span></div>
            </div>
            <Link href="/loja" className="btn btn-outline btn-light">Explorar Coleção</Link>
          </div>
        </div>
      </section>

      <YarnDivider soft />

      {/* ================= CURSO ================= */}
      <CourseSection course={course} />

      <YarnDivider soft />

      {/* ================= SERVIÇOS EM DESTAQUE ================= */}
      <section className="feature-services" id="servicos">
        <div className="container feature-grid">

          <article className="feature-card">
            <div className="feature-img feature-img--sob-medida" aria-hidden="true">
              <span className="feature-badge">Sob Medida</span>
            </div>
            <div className="feature-body">
              <p className="eyebrow">Sob Medida</p>
              <h3 className="feature-title">Criado para o seu corpo</h3>
              <p className="feature-text">
                Peças construídas do zero a partir das suas medidas e preferências. Do
                tecido ao acabamento, cada detalhe é pensado exclusivamente para você.
              </p>
              <a href="#contato" className="link-arrow">Saiba mais</a>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-img feature-img--reformas" aria-hidden="true">
              <span className="feature-badge">Ajustes & Reformas</span>
            </div>
            <div className="feature-body">
              <p className="eyebrow">Ajustes & Reformas</p>
              <h3 className="feature-title">Nova vida ao que você já ama</h3>
              <p className="feature-text">
                Aquela peça favorita que não serve mais? Ajustamos, reformamos e
                transformamos com o mesmo cuidado de uma peça nova.
              </p>
              <a href="#contato" className="link-arrow">Saiba mais</a>
            </div>
          </article>

        </div>
      </section>

      <YarnDivider soft />

      {/* ================= GRID DE SERVIÇOS ================= */}
      <section className="services-grid-section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">O que fazemos</p>
            <h2 className="section-title">Nossos Serviços</h2>
          </div>

          <div className="services-grid">
            <article className="service-item">
              <span className="service-icon">🧵</span>
              <h4 className="service-name">Costura Sob Medida</h4>
              <p className="service-desc">Do molde ao acabamento, feito só para você.</p>
            </article>

            <article className="service-item">
              <span className="service-icon">✂️</span>
              <h4 className="service-name">Ajustes & Reformas</h4>
              <p className="service-desc">Precisão em cada costura.</p>
            </article>

            <article className="service-item">
              <span className="service-icon">🤍</span>
              <h4 className="service-name">Enxoval & Ocasiões Especiais</h4>
              <p className="service-desc">Vestidos de noiva, madrinhas e formaturas.</p>
            </article>

            <Link href="/loja/curso-croche-iniciantes" className="service-item">
              <span className="service-icon">🧶</span>
              <h4 className="service-name">Aulas de Crochê</h4>
              <p className="service-desc">Aprenda o ofício no seu ritmo, com vídeo completo.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PRODUTOS ================= */}
      <section className="products-section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Peças da estação</p>
            <h2 className="section-title">Coleção em Destaque</h2>
          </div>

          <div className="products-grid">
            <Link href="/loja/bolsa-tote-croche" className="product-card">
              <div className="product-img product-img--tote">
                <span className="product-emoji">🧶</span>
                <span className="product-tag">Verão 25</span>
              </div>
              <div className="product-info">
                <h4 className="product-name">Bolsa Tote Crochê</h4>
                <p className="product-price">R$ 189,00</p>
              </div>
            </Link>

            <Link href="/loja/vestido-linho-croche" className="product-card">
              <div className="product-img product-img--vestido">
                <span className="product-emoji">🌿</span>
                <span className="product-tag">Sob Medida</span>
              </div>
              <div className="product-info">
                <h4 className="product-name">Vestido Linho Crochê</h4>
                <p className="product-price">R$ 480,00</p>
              </div>
            </Link>

            <Link href="/loja/top-rendado-natural" className="product-card">
              <div className="product-img product-img--top">
                <span className="product-emoji">🤍</span>
                <span className="product-tag">Edição Limitada</span>
              </div>
              <div className="product-info">
                <h4 className="product-name">Top Rendado Natural</h4>
                <p className="product-price">R$ 220,00</p>
              </div>
            </Link>
          </div>

          <div className="catalog-view-all">
            <Link href="/loja" className="link-arrow">Ver loja completa</Link>
          </div>
        </div>
      </section>

      <YarnDivider soft />

      {/* ================= SOBRE ================= */}
      <section className="about" id="sobre">
        <div className="container about-grid">
          <div className="about-media" aria-hidden="true">
            <div className="about-media-tag">Atelier · Florianópolis</div>
          </div>
          <div className="about-body">
            <p className="eyebrow">Sobre Nós</p>
            <h2 className="about-title">Peças atemporais<br />moldadas pela ilha</h2>
            <p className="about-lead">
              O Modas e Fios nasceu em Florianópolis para criar peças atemporais
              moldadas pelo espírito da ilha.
            </p>
            <p className="about-text">
              Fundado com a missão de resgatar o valor da costura artesanal, o Modas e
              Fios é um atelier boutique localizado no coração de Florianópolis. Aqui,
              cada peça é tratada como única — porque você é única. Trabalhamos com
              tecidos selecionados, modelagem personalizada e um atendimento próximo que
              começa na primeira consulta e vai até o último ponto.
            </p>
            <a href="#sobre" className="btn btn-outline">Conheça Nossa História</a>
          </div>
        </div>
      </section>

      {/* ================= LINKS RÁPIDOS ================= */}
      <section className="quick-links">
        <div className="container quick-grid">
          <div className="quick-col">
            <h5 className="quick-title">Agendamento</h5>
            <p className="quick-text">Agende sua consulta de modelagem.</p>
            <a href="#contato" className="link-arrow link-arrow--sm">Agendar</a>
          </div>
          <div className="quick-col">
            <h5 className="quick-title">Contato</h5>
            <p className="quick-text">Fale com a nossa equipe pelo WhatsApp.</p>
            <a href="#contato" className="link-arrow link-arrow--sm">Conversar</a>
          </div>
          <div className="quick-col">
            <h5 className="quick-title">Portfólio</h5>
            <p className="quick-text">Explore os trabalhos da nossa coleção.</p>
            <Link href="/loja" className="link-arrow link-arrow--sm">Ver peças</Link>
          </div>
          <div className="quick-col">
            <h5 className="quick-title">Imprensa</h5>
            <p className="quick-text">Veja nossas menções e coberturas.</p>
            <a href="#" className="link-arrow link-arrow--sm">Saiba mais</a>
          </div>
        </div>
      </section>

      {/* ================= CONTATO / FORM ================= */}
      <section className="contact" id="contato">
        <div className="container contact-grid">
          <div className="contact-intro">
            <p className="eyebrow">Vamos criar juntas</p>
            <h2 className="contact-title">Agende sua consulta</h2>
            <p className="contact-text">
              Conte-nos sobre a peça dos seus sonhos. Retornamos pelo WhatsApp para
              combinar os detalhes da sua primeira consulta de modelagem.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
