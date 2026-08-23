"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createUploadTarget, confirmFileUpload, deleteProductFile } from "./actions";

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function CourseFilesManager({ productId, initialFiles }) {
  const [files, setFiles] = useState(initialFiles || []);
  const [progress, setProgress] = useState(null); // { name, pct } | null
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setError("");
    setProgress({ name: file.name, pct: 0 });

    try {
      const target = await createUploadTarget(productId, file.name);
      if (target.error) throw new Error(target.error);

      const supabase = createClient();
      if (!supabase) throw new Error("Supabase não configurado.");

      const { error: uploadError } = await supabase.storage
        .from("course-files")
        .uploadToSignedUrl(target.path, target.token, file);
      if (uploadError) throw new Error("Falha ao enviar o arquivo.");

      const result = await confirmFileUpload(
        productId,
        target.path,
        file.name,
        file.size,
        file.type
      );
      if (result.error) throw new Error(result.error);

      setFiles((prev) => [
        ...prev,
        { id: result.id, title: file.name, file_size_bytes: file.size },
      ]);
    } catch (err) {
      setError(err.message || "Erro ao enviar o arquivo.");
    } finally {
      setProgress(null);
    }
  }

  function handleDelete(fileId) {
    startTransition(async () => {
      await deleteProductFile(fileId, productId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    });
  }

  return (
    <div className="admin-files-manager">
      <h4 style={{ marginTop: 0 }}>Arquivos do curso</h4>
      <p className="contact-text" style={{ fontSize: "13px" }}>
        Vídeo completo do curso, PDFs de apoio, etc. A aluna baixa tudo depois de comprar.
        Sem limite de tamanho — o envio vai direto para o armazenamento.
      </p>

      {files.length > 0 && (
        <ul className="admin-files-list">
          {files.map((f) => (
            <li key={f.id}>
              <span>{f.title}</span>
              <span className="admin-files-size">{formatBytes(f.file_size_bytes)}</span>
              <button
                type="button"
                className="admin-toggle-btn"
                disabled={pending}
                onClick={() => handleDelete(f.id)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={!!progress}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => inputRef.current?.click()}
        disabled={!!progress}
      >
        {progress ? `Enviando ${progress.name}…` : "Adicionar arquivo"}
      </button>
      {error && <p className="form-note form-note--error">{error}</p>}
    </div>
  );
}
