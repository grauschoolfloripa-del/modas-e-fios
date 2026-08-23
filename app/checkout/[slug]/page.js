import { notFound, redirect } from "next/navigation";
import { getBySlugAsync, formatPrice } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/checkout/${slug}`);

  const item = await getBySlugAsync(slug);
  if (!item || item.type !== "produto" || item.saleMode === "espera") {
    redirect(`/loja/${slug}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <section className="contact catalog-detail">
      <div className="container catalog-detail-inner">
        <p className="eyebrow">Finalizar compra</p>
        <h1 className="contact-title">{item.title}</h1>
        <p className="contact-text catalog-detail-price">{formatPrice(item.price)}</p>
        <p className="contact-text">
          Confirme seus dados de contato e entrega. Na próxima tela você paga com
          segurança pelo Mercado Pago.
        </p>

        <CheckoutForm
          productSlug={item.slug}
          defaultName={profile?.full_name || ""}
          defaultPhone={profile?.phone || ""}
        />
      </div>
    </section>
  );
}
