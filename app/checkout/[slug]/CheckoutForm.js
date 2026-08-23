"use client";

import { useState } from "react";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function CheckoutForm({ productSlug, defaultName, defaultPhone }) {
  const [deliveryMethod, setDeliveryMethod] = useState("envio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setLoading(true);
    setError("");

    const data = new FormData(form);
    const shippingAddress =
      deliveryMethod === "envio"
        ? {
            cep: data.get("cep"),
            rua: data.get("rua"),
            numero: data.get("numero"),
            complemento: data.get("complemento"),
            bairro: data.get("bairro"),
            cidade: data.get("cidade"),
            estado: data.get("estado"),
          }
        : null;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          customerName: data.get("customerName"),
          phone: data.get("phone"),
          deliveryMethod,
          shippingAddress,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível continuar. Tente novamente.");
        setLoading(false);
        return;
      }
      window.location.href = json.initPoint;
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form className="contact-form checkout-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="customerName">Nome completo</label>
        <input type="text" id="customerName" name="customerName" defaultValue={defaultName} required />
      </div>
      <div className="field">
        <label htmlFor="phone">WhatsApp</label>
        <input type="tel" id="phone" name="phone" defaultValue={defaultPhone} placeholder="(48) 9 0000-0000" required />
      </div>

      <div className="field">
        <label>Forma de entrega</label>
        <div className="checkout-delivery-options">
          <label className="checkout-radio">
            <input
              type="radio"
              name="deliveryMethodRadio"
              checked={deliveryMethod === "envio"}
              onChange={() => setDeliveryMethod("envio")}
            />
            Envio pelos Correios
          </label>
          <label className="checkout-radio">
            <input
              type="radio"
              name="deliveryMethodRadio"
              checked={deliveryMethod === "retirada"}
              onChange={() => setDeliveryMethod("retirada")}
            />
            Retirar em mãos, no atelier
          </label>
        </div>
      </div>

      {deliveryMethod === "envio" && (
        <>
          <div className="admin-form-row">
            <div className="field">
              <label htmlFor="cep">CEP</label>
              <input type="text" id="cep" name="cep" placeholder="00000-000" required />
            </div>
            <div className="field">
              <label htmlFor="numero">Número</label>
              <input type="text" id="numero" name="numero" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="rua">Rua</label>
            <input type="text" id="rua" name="rua" required />
          </div>
          <div className="field">
            <label htmlFor="complemento">Complemento (opcional)</label>
            <input type="text" id="complemento" name="complemento" placeholder="Apto, bloco…" />
          </div>
          <div className="admin-form-row">
            <div className="field">
              <label htmlFor="bairro">Bairro</label>
              <input type="text" id="bairro" name="bairro" required />
            </div>
            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <input type="text" id="cidade" name="cidade" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" defaultValue="SC" required>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {deliveryMethod === "retirada" && (
        <p className="catalog-form-intro">
          Combinamos o horário de retirada pelo WhatsApp depois da confirmação do pagamento.
        </p>
      )}

      <button type="submit" className="btn btn-solid btn-block" disabled={loading}>
        {loading ? "Abrindo pagamento…" : "Ir para o pagamento"}
      </button>
      {error && <p className="form-note form-note--error">{error}</p>}
    </form>
  );
}
