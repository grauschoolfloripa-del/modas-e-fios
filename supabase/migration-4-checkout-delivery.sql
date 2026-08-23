-- ============================================================
-- MIGRAÇÃO 4 — checkout com entrega + acompanhamento de pedido
-- ============================================================
-- Peças físicas agora coletam telefone e endereço/forma de entrega no
-- checkout (envio ou retirada em mãos). Todo pedido ganha um status de
-- acompanhamento (fulfillment_status) separado do status de pagamento
-- — é o que a cliente e o admin usam pra saber "cadê meu pedido".

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists delivery_method text
    check (delivery_method in ('envio', 'retirada')),
  add column if not exists shipping_address jsonb,
  add column if not exists fulfillment_status text not null default 'aguardando_pagamento'
    check (fulfillment_status in (
      'aguardando_pagamento', 'preparando', 'enviado', 'pronto_retirada', 'entregue', 'cancelado'
    )),
  add column if not exists tracking_code text,
  add column if not exists fulfillment_notes text;

-- admin já pode editar pedidos (fulfillment) — a política de update
-- para orders ainda não existia (só existia select); agora adiciona.
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
