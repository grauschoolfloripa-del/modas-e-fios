"use client";

import { useState } from "react";

export default function ContactForm() {
  const [contactSent, setContactSent] = useState(false);

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
  );
}
