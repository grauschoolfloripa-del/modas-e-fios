"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyButton({ productSlug, needsDelivery }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleClick() {
    // peça física: primeiro coleta telefone e forma de entrega
    if (needsDelivery) {
      router.push(`/checkout/${productSlug}`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug }),
      });
      const data = await res.json();

      if (res.status === 401 && data.needsLogin) {
        router.push(`/login?next=/loja/${productSlug}`);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Não foi possível iniciar o pagamento.");
        setLoading(false);
        return;
      }
      window.location.href = data.initPoint;
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-solid btn-block" onClick={handleClick} disabled={loading}>
        {loading ? "Abrindo pagamento…" : "Comprar agora"}
      </button>
      {error && <p className="form-note form-note--error">{error}</p>}
    </div>
  );
}
