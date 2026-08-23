import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Painel Admin · Modas e Fios" };

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <section className="contact auth-page">
        <div className="container auth-page-inner">
          <p className="form-note form-note--error">
            O painel admin ainda não está configurado neste site (falta conectar o Supabase).
          </p>
        </div>
      </section>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <section className="admin-shell">
      <div className="container admin-shell-inner">
        <aside className="admin-nav">
          <p className="eyebrow">Painel Admin</p>
          <nav>
            <Link href="/admin">Visão geral</Link>
            <Link href="/admin/produtos">Produtos &amp; Cursos</Link>
            <Link href="/admin/pedidos">Pedidos</Link>
            <Link href="/admin/lista-de-espera">Lista de espera</Link>
            <Link href="/admin/configuracoes">Configurações</Link>
          </nav>
        </aside>
        <div className="admin-content">{children}</div>
      </div>
    </section>
  );
}
