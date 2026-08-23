"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function YarnDivider({ soft }) {
  return (
    <div className={`yarn-divider${soft ? " yarn-divider--soft" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1200 24" preserveAspectRatio="none" width="100%" height="24">
        <path d="M0,12 Q15,2 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12" />
      </svg>
    </div>
  );
}

export default function Home() {
  const [contactSent, setContactSent] = useState(false);

  const cineRef = useRef(null);
  const pinRef = useRef(null);
  const heroLayerRef = useRef(null);
  const kitLayerRef = useRef(null);
  const kitCapRef = useRef(null);
  const cueRef = useRef(null);
  const revealRefs = useRef([]);
  revealRefs.current = [];
  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  /* ---- Revelação suave ao rolar (marca js-reveal p/ fallback sem JS) ---- */
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");
    const items = revealRefs.current;
    if (!items.length) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );
      items.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
    items.forEach((el) => el.classList.add("is-visible"));
  }, []);

  /* ---- Palco cinematográfico: transição hero → kit controlada por scroll ---- */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cine = cineRef.current;
    const pin = pinRef.current;
    const heroLayer = heroLayerRef.current;
    const kitLayer = kitLayerRef.current;
    const kitCap = kitCapRef.current;
    const cue = cueRef.current;
    if (!cine || !pin || !heroLayer || !kitLayer || reduce) return;

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const lerp = (a, b, t) => a + (b - a) * t;
    const range = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let pinDistance = 1;
    const measure = () => {
      pinDistance = Math.max(cine.offsetHeight - pin.offsetHeight, 1);
    };

    const render = () => {
      const p = clamp((window.scrollY - cine.offsetTop) / pinDistance, 0, 1);

      const eH = easeInOut(range(p, 0.0, 0.62));
      heroLayer.style.transform =
        "translateY(" + lerp(0, -5, eH) + "%) scale(" + lerp(1, 0.86, eH) +
        ") translateZ(" + lerp(0, -260, eH) + "px) rotateX(" + lerp(0, -7, eH) + "deg)";
      heroLayer.style.opacity = String(lerp(1, 0, range(p, 0.15, 0.62)));

      const eK = easeOut(range(p, 0.22, 0.82));
      kitLayer.style.opacity = String(lerp(0, 1, range(p, 0.22, 0.6)));
      kitLayer.style.transform =
        "translateY(" + lerp(12, 0, eK) + "%) scale(" + lerp(0.9, 1, eK) + ")";

      if (kitCap) {
        const pc = range(p, 0.6, 0.98);
        kitCap.style.opacity = String(pc);
        kitCap.style.transform = "translateY(" + lerp(28, 0, easeOut(pc)) + "px)";
      }

      if (cue) cue.style.opacity = String(lerp(1, 0, range(p, 0.02, 0.16)));
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          render();
          ticking = false;
        });
        ticking = true;
      }
    };
    const onResize = () => {
      measure();
      render();
    };

    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.reset();
    setContactSent(true);
  };

  return (
    <>
      {/* ============ PALCO CINEMATOGRÁFICO: hero → kit (transição por scroll) ============ */}
      <div className="cine" id="hero" ref={cineRef}>
        <div className="cine__pin" ref={pinRef}>

          {/* CAMADA 1 — hero: faixa marrom (título) + vídeo + faixa marrom (texto/CTA) */}
          <div className="cine__layer cine__hero" ref={heroLayerRef}>
            <div className="hero-top">
              <div className="container">
                <p className="eyebrow hero-eyebrow">Atelier de Crochê · Florianópolis</p>
                <h1 className="hero-title">
                  Feito à mão,<br /><em>feito pra você</em>
                </h1>
              </div>
            </div>

            <div className="hero-video-frame">
              <video className="hero-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
                <source src="/assets/hero-croche.mp4" type="video/mp4" />
              </video>
              <div className="cine__scroll" ref={cueRef} aria-hidden="true">
                <span>role para ver a transição</span>
                <span className="cine__scroll-line"></span>
              </div>
            </div>

            <div className="hero-bottom">
              <div className="container">
                <p className="hero-sub">
                  Uma nova coleção moldada entre a sofisticação do atelier e a leveza da vida
                  em Florianópolis. Cada peça nasce de tecidos cuidadosamente selecionados,
                  com acabamento artesanal e caimento pensado para o seu corpo.
                </p>
                <a href="#colecao" className="btn btn-solid">Ver Coleção</a>
              </div>
            </div>
          </div>

          {/* CAMADA 2 — vídeo do kit (emerge conforme o scroll) */}
          <div className="cine__layer cine__kit" ref={kitLayerRef}>
            <video className="kit-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
              <source src="/assets/kit-croche.mp4" type="video/mp4" />
            </video>
            <div className="cine__kit-scrim" aria-hidden="true"></div>
            <div className="container cine__kit-caption" ref={kitCapRef}>
              <p className="eyebrow">Novidade · Enxoval de Bebê</p>
              <h2 className="cine__kit-title">Kit Bebê<br /><em>em Crochê</em></h2>
            </div>
          </div>

        </div>
      </div>

      {/* Conteúdo do Kit (após a transição) */}
      <section className="kit-content" id="kit-bebe">
        <div className="container kit-content-inner">
          <p className="kit-reveal-text reveal-on-scroll" ref={addRevealRef}>
            Cestas, mantas e peças delicadas feitas à mão, em fios naturais e cores
            suaves — personalizadas com o nome do seu bebê. Um enxoval único, do
            primeiro ponto ao último detalhe.
          </p>
          <a href="#contato" className="btn btn-solid reveal-on-scroll" ref={addRevealRef}>
            Encomendar o Kit
          </a>
        </div>
      </section>

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
            <Link href="/loja" className="btn btn-outline btn-light">Explorar Coleção</Link>
          </div>
        </div>
      </section>

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
              <h4 className="service-name">Aulas de Costura</h4>
              <p className="service-desc">Aprenda o ofício em turmas pequenas e práticas.</p>
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

          <form className="contact-form" noValidate onSubmit={handleContactSubmit}>
            <div className="field">
              <label htmlFor="nome">Seu nome</label>
              <input type="text" id="nome" name="nome" placeholder="Maria Clara" required />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="tel" id="whatsapp" name="whatsapp" placeholder="(48) 9 0000-0000" required />
            </div>
            <div className="field">
              <label htmlFor="mensagem">Sobre a peça</label>
              <textarea id="mensagem" name="mensagem" rows={3} placeholder="Conte um pouco sobre o que você imagina…"></textarea>
            </div>
            <button type="submit" className="btn btn-solid btn-block">Agendar Consulta</button>
            {contactSent && (
              <p className="form-note">Recebemos seu pedido! Em breve entraremos em contato. 🤍</p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
