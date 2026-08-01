/* Modas & Fios — interações da landing page */
(function () {
  "use strict";

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
