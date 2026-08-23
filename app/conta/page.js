import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Minha Conta · Modas e Fios" };

export default async function ContaPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <section className="contact auth-page">
        <div className="container auth-page-inner">
          <p className="form-note form-note--error">
            A área de contas ainda não está configurada neste site.
          </p>
        </div>
      </section>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/conta");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("expires_at, products(slug, title, type, cover_emoji)")
    .eq("user_id", user.id);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_cents, created_at, products(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="contact account-page">
      <div className="container">
        <div className="section-head account-head">
          <p className="eyebrow">Minha Conta</p>
          <h1 className="section-title">
            Olá, {profile?.full_name?.split(" ")[0] || "por aqui"}
          </h1>
          {profile?.role === "admin" && (
            <Link href="/admin" className="link-arrow" style={{ marginTop: "8px", display: "inline-block" }}>
              Ir para o painel admin
            </Link>
          )}
        </div>

        <h3>Meus cursos e peças</h3>
        {enrollments && enrollments.length > 0 ? (
          <div className="products-grid">
            {enrollments.map((e, i) => (
              <div className="product-card" key={i}>
                <div className="product-img">
                  <span className="product-emoji">{e.products?.cover_emoji}</span>
                </div>
                <div className="product-info">
                  <h4 className="product-name">{e.products?.title}</h4>
                  <p className="product-price">
                    {e.expires_at
                      ? `Acesso até ${new Date(e.expires_at).toLocaleDateString("pt-BR")}`
                      : "Acesso vitalício"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="contact-text">Você ainda não tem cursos ou peças. <Link href="/loja">Ver a loja</Link>.</p>
        )}

        <h3>Meus pedidos</h3>
        {orders && orders.length > 0 ? (
          <div className="scroll-table">
            <table className="orders-table">
              <thead>
                <tr><th>Data</th><th>Item</th><th>Valor</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                    <td>{o.products?.title}</td>
                    <td>{formatPrice(o.amount_cents / 100)}</td>
                    <td><span className={`order-status order-status--${o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="contact-text">Nenhum pedido ainda.</p>
        )}

        <form action="/logout" method="POST" style={{ marginTop: "40px" }}>
          <button type="submit" className="btn btn-outline">Sair</button>
        </form>
      </div>
    </section>
  );
}
