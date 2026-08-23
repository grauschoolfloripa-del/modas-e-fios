"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "./actions";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  if (state?.success) {
    return (
      <section className="contact auth-page">
        <div className="container auth-page-inner">
          <div className="contact-intro">
            <p className="eyebrow">Quase lá</p>
            <h1 className="contact-title">Conta criada</h1>
            <p className="contact-text">
              {state.confirmEmail
                ? "Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar a conta."
                : "Sua conta já está ativa."}
            </p>
            <Link href="/login" className="btn btn-solid">Ir para o login</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact auth-page">
      <div className="container auth-page-inner">
        <div className="contact-intro">
          <p className="eyebrow">Bem-vinda</p>
          <h1 className="contact-title">Criar conta</h1>
          <p className="contact-text">
            Crie sua conta para acompanhar seus pedidos e acessar seus cursos.
          </p>
        </div>

        <form className="contact-form" action={formAction}>
          <div className="field">
            <label htmlFor="fullName">Seu nome</label>
            <input type="text" id="fullName" name="fullName" placeholder="Maria Clara" required />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="voce@email.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" name="password" minLength={8} required />
          </div>
          <button type="submit" className="btn btn-solid btn-block" disabled={pending}>
            {pending ? "Criando conta…" : "Criar conta"}
          </button>
          {state?.error && <p className="form-note form-note--error">{state.error}</p>}
          <p className="auth-switch">
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
