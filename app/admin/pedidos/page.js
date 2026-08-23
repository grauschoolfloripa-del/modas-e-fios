import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="form-note form-note--error">Supabase ainda não configurado.</p>;
  }
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_cents, created_at, user_id, products(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Pedidos</h1>
      <div className="scroll-table">
        <table className="orders-table">
          <thead>
            <tr><th>Data</th><th>Item</th><th>Valor</th><th>Status</th></tr>
          </thead>
          <tbody>
            {(orders || []).map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                <td>{o.products?.title}</td>
                <td>{formatPrice(o.amount_cents / 100)}</td>
                <td><span className={`order-status order-status--${o.status}`}>{o.status}</span></td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={4}>Nenhum pedido ainda — normal até o Mercado Pago estar conectado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
