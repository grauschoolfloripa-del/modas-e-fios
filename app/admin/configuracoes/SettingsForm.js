"use client";

import { useActionState, useState, useTransition } from "react";
import { saveMercadoPagoSettings, testMercadoPagoConnection } from "./actions";

export default function SettingsForm({ status }) {
  const [state, formAction, pending] = useActionState(saveMercadoPagoSettings, null);
  const [testResult, setTestResult] = useState(null);
  const [testing, startTest] = useTransition();

  return (
    <div className="admin-settings-card">
      <h3>Mercado Pago</h3>
      <p className="contact-text">
        Pegue estas chaves em{" "}
        <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noreferrer">
          mercadopago.com.br/developers/panel
        </a>
        , em <strong>Suas integrações → (sua aplicação) → Credenciais de produção</strong>.
      </p>

      <form className="contact-form admin-form" action={formAction}>
        <div className="field">
          <label htmlFor="mpAccessToken">
            Access Token {status.mp_access_token && <span className="settings-badge">configurado</span>}
          </label>
          <input
            type="password"
            id="mpAccessToken"
            name="mpAccessToken"
            placeholder={status.mp_access_token ? "•••••••••••••••• (deixe em branco para manter)" : "APP_USR-..."}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="mpPublicKey">
            Public Key {status.mp_public_key && <span className="settings-badge">configurado</span>}
          </label>
          <input
            type="text"
            id="mpPublicKey"
            name="mpPublicKey"
            placeholder={status.mp_public_key ? "•••••••••••••••• (deixe em branco para manter)" : "APP_USR-..."}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="mpWebhookSecret">
            Chave secreta do Webhook {status.mp_webhook_secret && <span className="settings-badge">configurado</span>}
          </label>
          <input
            type="password"
            id="mpWebhookSecret"
            name="mpWebhookSecret"
            placeholder={status.mp_webhook_secret ? "•••••••••••••••• (deixe em branco para manter)" : "encontrada na notificação webhook"}
            autoComplete="off"
          />
        </div>

        <button type="submit" className="btn btn-solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar credenciais"}
        </button>
        {state?.error && <p className="form-note form-note--error">{state.error}</p>}
        {state?.success && <p className="form-note">Credenciais salvas. 🤍</p>}
      </form>

      {status.mp_access_token && (
        <div className="admin-settings-test">
          <button
            type="button"
            className="link-arrow link-arrow--sm"
            disabled={testing}
            onClick={() => startTest(async () => setTestResult(await testMercadoPagoConnection()))}
          >
            {testing ? "Testando…" : "Testar conexão"}
          </button>
          {testResult?.success && (
            <p className="form-note">Conectado à conta {testResult.accountEmail} ✓</p>
          )}
          {testResult?.error && <p className="form-note form-note--error">{testResult.error}</p>}
        </div>
      )}
    </div>
  );
}
