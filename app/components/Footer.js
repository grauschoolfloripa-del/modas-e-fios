"use client";

import { useState } from "react";

export default function Footer() {
  const [placeholder, setPlaceholder] = useState("Seu e-mail");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.reset();
    setSent(true);
    setPlaceholder("Inscrição confirmada! \u{1F90D}");
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">Modas <span className="logo-amp">&</span> Fios</p>
          <p className="footer-tagline">Atelier de Crochê · Florianópolis</p>
        </div>

        <div className="footer-newsletter">
          <p className="eyebrow">Newsletter</p>
          <p className="newsletter-text">
            Receba novidades, lançamentos e dicas de moda diretamente no seu e-mail.
          </p>
          <form className="newsletter-form" noValidate onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={placeholder}
              aria-label="Seu e-mail"
              required
              disabled={sent}
            />
            <button type="submit" className="btn btn-solid btn-sm">Inscrever</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <nav className="footer-links" aria-label="Links do rodapé">
          <a href="/#contato">Contato</a>
          <a href="#">Instagram</a>
          <a href="#">Perguntas Frequentes</a>
          <a href="#">Política de Privacidade</a>
          <a href="#">Termos de Uso</a>
        </nav>
        <p className="footer-copy">© 2025 Modas e Fios · Florianópolis, SC.</p>
      </div>
    </footer>
  );
}
