import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Editar item</h1>
      <ProductForm product={product} />
    </div>
  );
}
