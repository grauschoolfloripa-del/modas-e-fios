/**
 * Catálogo único — produtos físicos e cursos compartilham o mesmo modelo.
 * Fase 2: dados de exemplo (seed). Na Fase 3 isso passa a vir do Supabase,
 * com o admin cadastrando cada item por um painel.
 */

export const CATALOG = [
  {
    slug: "bolsa-tote-croche",
    type: "produto",
    title: "Bolsa Tote Crochê",
    tagline: "Verão 25",
    price: 189.0,
    emoji: "🧶",
    coverClass: "product-img--tote",
    shortDescription: "Bolsa tote feita à mão em crochê, algodão 100% natural.",
    description: [
      "Peça feita à mão em crochê, com fio 100% algodão natural. Estrutura firme para o dia a dia, alças reforçadas e acabamento artesanal em cada carreira de pontos.",
      "Cada bolsa é única — pequenas variações de textura fazem parte do processo manual.",
    ],
  },
  {
    slug: "vestido-linho-croche",
    type: "produto",
    title: "Vestido Linho Crochê",
    tagline: "Sob Medida",
    price: 480.0,
    emoji: "🌿",
    coverClass: "product-img--vestido",
    shortDescription: "Vestido em linho com detalhes em crochê, sob medida.",
    description: [
      "Vestido construído sob medida a partir das suas medidas — tecido de linho leve combinado com painéis de crochê feitos à mão.",
      "Ideal para o calor de Florianópolis: caimento fluido, respirável, com acabamento artesanal do atelier.",
    ],
  },
  {
    slug: "top-rendado-natural",
    type: "produto",
    title: "Top Rendado Natural",
    tagline: "Edição Limitada",
    price: 220.0,
    emoji: "🤍",
    coverClass: "product-img--top",
    shortDescription: "Top rendado em crochê, edição limitada.",
    description: [
      "Top com renda de crochê trabalhada à mão, em edição limitada — poucas peças por lote.",
      "Fio natural em tom cru, acabamento delicado, pensado para compor com looks de verão.",
    ],
  },
  {
    slug: "curso-croche-iniciantes",
    type: "curso",
    title: "Crochê para Iniciantes",
    tagline: "Curso Online",
    price: 49.9,
    emoji: "🧵",
    coverClass: "product-img--tote",
    accessType: "vitalicio",
    shortDescription: "Aprenda os pontos base do crochê e crie sua primeira peça.",
    description: [
      "Curso gravado, para assistir quando quiser: do ponto baixo ao ponto alto, leitura de gráficos e o passo a passo completo para criar sua primeira peça em crochê.",
      "Conteúdo em produção — os módulos e a carga horária final serão confirmados antes do lançamento.",
    ],
  },
];

export function getAllSlugs() {
  return CATALOG.map((item) => item.slug);
}

export function getBySlug(slug) {
  return CATALOG.find((item) => item.slug === slug) || null;
}

export function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Versões "conscientes do banco": tentam o Supabase primeiro (produtos
 * cadastrados pelo admin) e caem para os dados estáticos acima se o
 * Supabase não estiver configurado, a consulta falhar, ou não houver
 * nenhum produto publicado ainda. A loja nunca fica fora do ar por
 * causa disso — só some a possibilidade de gerenciar pelo painel.
 *
 * Use apenas em Server Components (usa cookies() por baixo dos panos).
 */
function mapDbProduct(row) {
  return {
    slug: row.slug,
    type: row.type,
    title: row.title,
    tagline: row.tagline || "",
    price: row.price_cents / 100,
    emoji: row.cover_emoji || "🧶",
    coverClass: row.cover_class || "product-img--tote",
    coverImageUrl: row.cover_image_url || null,
    accessType: row.access_type || undefined,
    shortDescription: row.short_description || "",
    description: (row.description || "").split(/\n\s*\n/).filter(Boolean),
  };
}

export async function getCatalogAsync() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    if (!supabase) return CATALOG;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return CATALOG;
    return data.map(mapDbProduct);
  } catch {
    return CATALOG;
  }
}

export async function getBySlugAsync(slug) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    if (!supabase) return getBySlug(slug);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) return getBySlug(slug);
    return mapDbProduct(data);
  } catch {
    return getBySlug(slug);
  }
}
