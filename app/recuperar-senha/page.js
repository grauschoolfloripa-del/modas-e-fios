"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset } from "./actions";

export default function RecuperarSenhaPage() {
  const [state, formAction, pending] = useActionState(requestReset, null);

  return (
    <section className="contact auth-page">
      <div className="container auth-page-inner">
        <div className="contact-intro">
          <p className="eyebrow">Recuperar acesso</p>
          <h1 className="contact-title">Esqueci minha senha</h1>
          <p className="contact-text">
            Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.
          </p>
        </div>

        {state?.success ? (
          <p className="form-note">
            Se este e-mail tiver uma conta, você vai receber o link em instantes. 🤍
          </p>
        ) : (
          <form className="contact-form" action={formAction}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="voce@email.com" required />
            </div>
            <button type="submit" className="btn btn-solid btn-block" disabled={pending}>
              {pending ? "Enviando…" : "Enviar link"}
            </button>
            {state?.error && <p className="form-note form-note--error">{state.error}</p>}
            <p className="auth-switch">
              <Link href="/login">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
