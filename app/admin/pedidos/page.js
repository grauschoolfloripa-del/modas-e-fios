import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/catalog";
import OrderRow from "./OrderRow";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="form-note form-note--error">Supabase ainda não configurado.</p>;
  }
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, status, fulfillment_status, tracking_code, amount_cents, created_at, customer_name, phone, delivery_method, shipping_address, products(title, type)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Pedidos</h1>
      <p className="contact-text" style={{ fontSize: "13px" }}>Clique num pedido para ver os detalhes de entrega e atualizar o status.</p>
      <div className="scroll-table">
        <table className="orders-table">
          <thead>
            <tr><th>Data</th><th>Item</th><th>Valor</th><th>Pagamento</th><th>Acompanhamento</th><th></th></tr>
          </thead>
          <tbody>
            {(orders || []).map((o) => (
              <OrderRow key={o.id} order={o} formattedPrice={formatPrice(o.amount_cents / 100)} />
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6}>Nenhum pedido ainda — normal até o Mercado Pago estar conectado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
