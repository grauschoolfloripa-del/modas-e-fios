import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="form-note form-note--error">Supabase ainda não configurado.</p>;
  }

  const [{ count: products }, { count: pendingOrders }, { count: approvedOrders }, { count: waitlist }] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("waitlist").select("id", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Produtos e cursos", value: products ?? 0 },
    { label: "Pedidos pendentes", value: pendingOrders ?? 0 },
    { label: "Pedidos aprovados", value: approvedOrders ?? 0 },
    { label: "Interessados na lista de espera", value: waitlist ?? 0 },
  ];

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Visão geral</h1>
      <div className="admin-cards">
        {cards.map((c) => (
          <div className="admin-card" key={c.label}>
            <p className="admin-card-value">{c.value}</p>
            <p className="admin-card-label">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
