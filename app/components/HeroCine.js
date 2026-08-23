"use client";

import { useEffect, useRef } from "react";

export default function HeroCine() {
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

  return (
    <>
      {/* ============ PALCO CINEMATOGRÁFICO: hero → kit (transição por scroll) ============ */}
      <div className="cine" id="hero" ref={cineRef}>
        <div className="cine__pin" ref={pinRef}>

          {/* CAMADA 1 — hero: vídeo em tela cheia, texto ancorado embaixo */}
          <div className="cine__layer cine__hero" ref={heroLayerRef}>
            <video className="hero-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
              <source src="/assets/hero-croche.mp4" type="video/mp4" />
            </video>
            <div className="hero-scrim" aria-hidden="true"></div>

            <div className="hero-inner">
              <p className="eyebrow hero-eyebrow">Atelier de Crochê · Florianópolis</p>
              <h1 className="hero-title">
                Feito à mão,<br /><em>feito pra você</em>
              </h1>
              <p className="hero-sub">
                Uma nova coleção moldada entre a sofisticação do atelier e a leveza da vida
                em Florianópolis. Cada peça nasce de tecidos cuidadosamente selecionados,
                com acabamento artesanal e caimento pensado para o seu corpo.
              </p>
              <div className="hero-actions">
                <a href="#colecao" className="btn btn-solid">Ver Coleção</a>
                <a href="#curso" className="btn btn-outline btn-light">Aprender Crochê</a>
              </div>
            </div>

            <div className="cine__scroll" ref={cueRef} aria-hidden="true">
              <span>role para ver a transição</span>
              <span className="cine__scroll-line"></span>
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
          <div className="kit-tags reveal-on-scroll" ref={addRevealRef}>
            <span className="tag-pill">Personalizado com o nome do bebê</span>
            <span className="tag-pill">Fios 100% naturais</span>
            <span className="tag-pill">Feito à mão, sob encomenda</span>
          </div>
          <a href="#contato" className="btn btn-solid reveal-on-scroll" ref={addRevealRef}>
            Encomendar o Kit
          </a>
        </div>
      </section>
    </>
  );
}
