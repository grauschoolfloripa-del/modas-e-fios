"use client";

import { useState } from "react";

export default function WaitlistForm({ productSlug, productTitle }) {
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    const data = new FormData(form);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          productSlug,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Não foi possível enviar. Tente novamente.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("done");
    } catch {
      setErrorMsg("Falha de conexão. Tente novamente.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="form-note">
        Recebemos seu interesse em <strong>{productTitle}</strong>! Avisamos você por
        e-mail assim que abrir. 🤍
      </p>
    );
  }

  return (
    <form className="contact-form waitlist-form" noValidate onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`wl-name-${productSlug}`}>Seu nome</label>
        <input type="text" id={`wl-name-${productSlug}`} name="name" placeholder="Maria Clara" required />
      </div>
      <div className="field">
        <label htmlFor={`wl-email-${productSlug}`}>Seu e-mail</label>
        <input type="email" id={`wl-email-${productSlug}`} name="email" placeholder="voce@email.com" required />
      </div>
      <button type="submit" className="btn btn-solid btn-block" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Quero ser avisada"}
      </button>
      {status === "error" && <p className="form-note form-note--error">{errorMsg}</p>}
    </form>
  );
}
