"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "./actions";

export default function ProductForm({ product }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [type, setType] = useState(product?.type || "produto");
  const [accessType, setAccessType] = useState(product?.access_type || "vitalicio");

  return (
    <form className="contact-form admin-form" action={formAction}>
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="field">
        <label htmlFor="title">Título</label>
        <input type="text" id="title" name="title" defaultValue={product?.title} required />
      </div>

      <div className="field">
        <label htmlFor="slug">Slug (URL) — deixe em branco para gerar do título</label>
        <input type="text" id="slug" name="slug" defaultValue={product?.slug} placeholder="ex: bolsa-tote-croche" />
      </div>

      <div className="admin-form-row">
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="produto">Peça física</option>
            <option value="curso">Curso</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="price">Preço (R$)</label>
          <input
            type="text"
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            placeholder="49,90"
            required
          />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="field">
          <label htmlFor="tagline">Etiqueta (tag curta)</label>
          <input type="text" id="tagline" name="tagline" defaultValue={product?.tagline} placeholder="ex: Edição Limitada" />
        </div>
        <div className="field">
          <label htmlFor="coverEmoji">Emoji de capa</label>
          <input type="text" id="coverEmoji" name="coverEmoji" defaultValue={product?.cover_emoji || "🧶"} maxLength={4} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="shortDescription">Descrição curta (aparece no card)</label>
        <input type="text" id="shortDescription" name="shortDescription" defaultValue={product?.short_description} />
      </div>

      <div className="field">
        <label htmlFor="description">Descrição completa (aparece na página do item)</label>
        <textarea id="description" name="description" rows={5} defaultValue={product?.description}></textarea>
      </div>

      {type === "curso" && (
        <div className="admin-form-row">
          <div className="field">
            <label htmlFor="accessType">Tipo de acesso</label>
            <select
              id="accessType"
              name="accessType"
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
            >
              <option value="vitalicio">Vitalício</option>
              <option value="periodo">Por período</option>
            </select>
          </div>
          {accessType === "periodo" && (
            <div className="field">
              <label htmlFor="accessDurationDays">Duração (dias)</label>
              <input
                type="number"
                id="accessDurationDays"
                name="accessDurationDays"
                min={1}
                defaultValue={product?.access_duration_days || 365}
              />
            </div>
          )}
        </div>
      )}

      <div className="field field--checkbox">
        <label>
          <input type="checkbox" name="published" defaultChecked={product?.published ?? false} />
          {" "}Publicado (visível na loja)
        </label>
      </div>

      <button type="submit" className="btn btn-solid" disabled={pending}>
        {pending ? "Salvando…" : "Salvar"}
      </button>
      {state?.error && <p className="form-note form-note--error">{state.error}</p>}
    </form>
  );
}
