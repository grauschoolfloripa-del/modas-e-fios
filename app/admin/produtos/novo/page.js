import ProductForm from "../ProductForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "24px" }}>Novo item</h1>
      <ProductForm product={null} />
    </div>
  );
}
