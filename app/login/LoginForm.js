"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginForm({ next }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form className="contact-form" action={formAction}>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" name="email" placeholder="voce@email.com" required />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit" className="btn btn-solid btn-block" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      {state?.error && <p className="form-note form-note--error">{state.error}</p>}
      <p className="auth-switch">
        Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
      <p className="auth-switch">
        <Link href="/recuperar-senha">Esqueci minha senha</Link>
      </p>
    </form>
  );
}
