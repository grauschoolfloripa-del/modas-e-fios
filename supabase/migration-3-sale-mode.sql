-- ============================================================
-- MIGRAÇÃO 3 — modo de venda por produto (à venda x lista de espera)
-- ============================================================
-- Antes, a loja inteira mostrava "comprar" ou "lista de espera" com
-- base numa única configuração global do Mercado Pago. Agora cada
-- produto/curso tem essa escolha própria, feita no cadastro.

alter table public.products
  add column if not exists sale_mode text not null default 'venda'
  check (sale_mode in ('venda', 'espera'));
