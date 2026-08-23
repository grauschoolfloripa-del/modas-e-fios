"use client";

import { useState, useTransition } from "react";
import { updateFulfillment } from "./actions";
import { FULFILLMENT_LABELS, fulfillmentLabel } from "@/lib/orders";

export default function OrderRow({ order, formattedPrice }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.fulfillment_status);
  const [trackingCode, setTrackingCode] = useState(order.tracking_code || "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const addr = order.shipping_address;
  const isProduto = order.products?.type === "produto";

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateFulfillment(order.id, status, trackingCode);
      setSaved(true);
    });
  }

  return (
    <>
      <tr className="admin-order-row" onClick={() => setOpen((v) => !v)}>
        <td>{new Date(order.created_at).toLocaleString("pt-BR")}</td>
        <td>{order.products?.title}</td>
        <td>{formattedPrice}</td>
        <td><span className={`order-status order-status--${order.status}`}>{order.status}</span></td>
        <td><span className={`order-status order-status--${order.status === "approved" ? "approved" : "pending"}`}>{fulfillmentLabel(order.fulfillment_status)}</span></td>
        <td className="admin-order-toggle">{open ? "▲" : "▼"}</td>
      </tr>
      {open && (
        <tr className="admin-order-detail">
          <td colSpan={6}>
            <div className="admin-order-detail-grid">
              <div>
                <p className="admin-order-detail-label">Cliente</p>
                <p>{order.customer_name || "—"}</p>
                <p>{order.phone || "—"}</p>
              </div>
              <div>
                <p className="admin-order-detail-label">Entrega</p>
                {isProduto ? (
                  order.delivery_method === "envio" && addr ? (
                    <p>
                      Envio — {addr.rua}, {addr.numero} {addr.complemento && `(${addr.complemento})`}
                      <br />
                      {addr.bairro} — {addr.cidade}/{addr.estado} · CEP {addr.cep}
                    </p>
                  ) : order.delivery_method === "retirada" ? (
                    <p>Retirada em mãos, no atelier</p>
                  ) : (
                    <p>—</p>
                  )
                ) : (
                  <p>Curso digital — sem entrega física</p>
                )}
              </div>

              {isProduto && (
                <div className="admin-order-detail-form">
                  <p className="admin-order-detail-label">Atualizar acompanhamento</p>
                  <div className="admin-form-row">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      {Object.entries(FULFILLMENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Código de rastreio (opcional)"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleSave} disabled={pending}>
                    {pending ? "Salvando…" : "Salvar"}
                  </button>
                  {saved && <span className="settings-badge" style={{ marginLeft: "10px" }}>salvo</span>}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
