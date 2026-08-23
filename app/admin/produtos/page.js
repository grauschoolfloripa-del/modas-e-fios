import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/catalog";
import ToggleButton from "./ToggleButton";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="form-note form-note--error">Supabase ainda não configurado.</p>;
  }
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, type, title, price_cents, published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="section-title">Produtos &amp; Cursos</h1>
        <Link href="/admin/produtos/novo" className="btn btn-solid btn-sm">Novo item</Link>
      </div>

      <div className="scroll-table">
        <table className="orders-table">
          <thead>
            <tr><th>Título</th><th>Tipo</th><th>Preço</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(products || []).map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.type === "curso" ? "Curso" : "Peça física"}</td>
                <td>{formatPrice(p.price_cents / 100)}</td>
                <td>
                  <span className={`order-status order-status--${p.published ? "approved" : "pending"}`}>
                    {p.published ? "publicado" : "rascunho"}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <Link href={`/admin/produtos/${p.id}`} className="link-arrow link-arrow--sm">Editar</Link>
                  <ToggleButton id={p.id} published={p.published} />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={5}>Nenhum produto cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
