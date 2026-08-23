"use client";

import { useActionState, useRef, useState } from "react";
import { saveProduct, createCoverUploadTarget } from "./actions";
import { createClient } from "@/lib/supabase/client";
import CourseFilesManager from "./CourseFilesManager";

export default function ProductForm({ product, initialFiles }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [type, setType] = useState(product?.type || "produto");
  const [accessType, setAccessType] = useState(product?.access_type || "vitalicio");
  const [coverPreview, setCoverPreview] = useState(product?.cover_image_url || null);
  const [coverImageUrl, setCoverImageUrl] = useState(product?.cover_image_url || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const coverInputRef = useRef(null);

  async function handleCoverSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCoverError("");

    if (file.size > 10 * 1024 * 1024) {
      setCoverError("A imagem deve ter até 10MB.");
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    try {
      const target = await createCoverUploadTarget(file.name);
      if (target.error) throw new Error(target.error);

      const supabase = createClient();
      if (!supabase) throw new Error("Supabase não configurado.");

      const { error: uploadError } = await supabase.storage
        .from("product-covers")
        .uploadToSignedUrl(target.path, target.token, file);
      if (uploadError) throw new Error("Falha ao enviar a imagem.");

      setCoverImageUrl(target.publicUrl);
    } catch (err) {
      setCoverError(err.message || "Erro ao enviar a imagem.");
      setCoverPreview(product?.cover_image_url || null);
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <>
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
            <label htmlFor="coverEmoji">Emoji (usado se não houver imagem de capa)</label>
            <input type="text" id="coverEmoji" name="coverEmoji" defaultValue={product?.cover_emoji || "🧶"} maxLength={4} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="coverImage">Imagem de capa (foto ou arte do produto/curso)</label>
          <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
          {coverPreview && (
            <img src={coverPreview} alt="" className="admin-cover-preview" />
          )}
          <input
            ref={coverInputRef}
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={handleCoverSelect}
            disabled={coverUploading}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
          >
            {coverUploading ? "Enviando…" : coverPreview ? "Trocar imagem" : "Escolher imagem"}
          </button>
          <span className="admin-field-hint">JPG ou PNG, até 10MB. O envio é imediato, direto para o armazenamento.</span>
          {coverError && <p className="form-note form-note--error">{coverError}</p>}
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

        <div className="admin-form-row">
          <div className="field">
            <label htmlFor="saleMode">Modo de venda</label>
            <select id="saleMode" name="saleMode" defaultValue={product?.sale_mode || "venda"}>
              <option value="venda">À venda (mostra botão Comprar)</option>
              <option value="espera">Lista de espera (ainda não vende)</option>
            </select>
          </div>
          <div className="field field--checkbox" style={{ justifyContent: "flex-end" }}>
            <label>
              <input type="checkbox" name="published" defaultChecked={product?.published ?? false} />
              {" "}Publicado (visível na loja)
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {state?.error && <p className="form-note form-note--error">{state.error}</p>}
      </form>

      {product?.id && type === "curso" && (
        <CourseFilesManager productId={product.id} initialFiles={initialFiles || []} />
      )}
      {!product?.id && (
        <p className="admin-field-hint" style={{ marginTop: "24px" }}>
          Salve o item primeiro — depois de criado, você volta aqui para anexar o vídeo do curso.
        </p>
      )}
    </>
  );
}
