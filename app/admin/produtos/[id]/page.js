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

  const { data: files } = await supabase
    .from("product_files")
    .select("id, title, file_size_bytes")
    .eq("product_id", id)
    .order("created_at");

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Editar item</h1>
      <ProductForm product={product} initialFiles={files || []} />
    </div>
  );
}
