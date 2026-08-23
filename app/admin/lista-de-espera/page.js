import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="form-note form-note--error">Supabase ainda não configurado.</p>;
  }
  const { data: entries } = await supabase
    .from("waitlist")
    .select("name, email, product_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Lista de espera</h1>
      <p className="contact-text">Pessoas que pediram para ser avisadas quando um item abrir para venda.</p>
      <div className="scroll-table">
        <table className="orders-table">
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Item</th><th>Data</th></tr>
          </thead>
          <tbody>
            {(entries || []).map((e, i) => (
              <tr key={i}>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.product_slug}</td>
                <td>{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
            {(!entries || entries.length === 0) && (
              <tr><td colSpan={4}>Ninguém se inscreveu ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
