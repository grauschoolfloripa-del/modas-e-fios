/* Modas & Fios — interações da landing page */
(function () {
  "use strict";

  /* ---- Revelação 3D ao rolar (marca js-reveal p/ fallback sem JS) ---- */
  document.documentElement.classList.add("js-reveal");

  var revealItems = document.querySelectorAll(".reveal-on-scroll");
  if (revealItems.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );
      revealItems.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      /* Navegador sem suporte: mostra tudo */
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---- Palco cinematográfico: transição hero → kit controlada por scroll ---- */
  (function initCine() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cine = document.querySelector("[data-cine]");
    if (!cine || reduce) return; // reduced-motion: CSS empilha os vídeos

    var pin       = cine.querySelector(".cine__pin");
    var heroLayer = cine.querySelector("[data-cine-hero]");
    var kitLayer  = cine.querySelector("[data-cine-kit]");
    var kitCap    = cine.querySelector("[data-cine-kitcap]");
    var cue       = cine.querySelector("[data-cine-cue]");
    if (!heroLayer || !kitLayer) return;

    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function range(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
    function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    var pinDistance = 1;
    function measure() {
      pinDistance = Math.max(cine.offsetHeight - pin.offsetHeight, 1);
    }

    function render() {
      var p = clamp((window.scrollY - cine.offsetTop) / pinDistance, 0, 1);

      // Camada 1 — hero recua em 3D e some
      var eH = easeInOut(range(p, 0.0, 0.62));
      heroLayer.style.transform =
        "translateY(" + lerp(0, -5, eH) + "%) scale(" + lerp(1, 0.86, eH) +
        ") translateZ(" + lerp(0, -260, eH) + "px) rotateX(" + lerp(0, -7, eH) + "deg)";
      heroLayer.style.opacity = String(lerp(1, 0, range(p, 0.15, 0.62)));

      // Camada 2 — kit emerge de baixo e assume
      var eK = easeOut(range(p, 0.22, 0.82));
      kitLayer.style.opacity = String(lerp(0, 1, range(p, 0.22, 0.6)));
      kitLayer.style.transform =
        "translateY(" + lerp(12, 0, eK) + "%) scale(" + lerp(0.9, 1, eK) + ")";

      // rótulo do kit aparece no fim da transição
      if (kitCap) {
        var pc = range(p, 0.6, 0.98);
        kitCap.style.opacity = String(pc);
        kitCap.style.transform = "translateY(" + lerp(28, 0, easeOut(pc)) + "px)";
      }

      // indicador de scroll some no início
      if (cue) cue.style.opacity = String(lerp(1, 0, range(p, 0.02, 0.16)));
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () { render(); ticking = false; });
        ticking = true;
      }
    }

    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); render(); });
    // recalcula quando os vídeos carregam (podem mudar a métrica)
    window.addEventListener("load", function () { measure(); render(); });
  })();

  /* ---- Menu mobile ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Header: sombra sutil ao rolar ---- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.style.boxShadow =
        window.scrollY > 20 ? "0 1px 24px rgba(61,43,31,0.08)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Formulário de contato ---- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      contactForm.reset();
      if (formNote) formNote.hidden = false;
    });
  }

  /* ---- Newsletter ---- */
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!newsletterForm.checkValidity()) {
        newsletterForm.reportValidity();
        return;
      }
      var input = newsletterForm.querySelector("input");
      newsletterForm.reset();
      if (input) input.placeholder = "Inscrição confirmada! 🤍";
    });
  }
})();
