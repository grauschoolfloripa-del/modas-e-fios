-- ============================================================
-- MODAS & FIOS — Schema do banco (Supabase / Postgres)
-- ============================================================
-- Como aplicar:
--   1. Crie um projeto em https://supabase.com (gratuito).
--   2. Abra o SQL Editor do projeto e cole este arquivo inteiro. Rode.
--   3. Copie as 3 chaves em Project Settings > API e Project Settings > Data API
--      para as variáveis de ambiente do site (veja README-CREDENCIAIS.md).
--   4. Crie sua conta pelo site (/cadastro) e depois rode, uma única vez,
--      no SQL Editor, trocando o e-mail pelo seu:
--
--        update public.profiles set role = 'admin'
--        where id = (select id from auth.users where email = 'voce@exemplo.com');
--
--      Esse é o único jeito de virar admin — por segurança, não existe
--      forma de fazer isso pela interface do site.
-- ============================================================

-- ---------- extensões ----------
create extension if not exists "pgcrypto";

-- ---------- perfis (estende auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  cpf text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: o usuário atual é admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- catálogo (produtos físicos e cursos, mesmo modelo) ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('produto', 'curso')),
  title text not null,
  tagline text,
  short_description text,
  description text,
  price_cents integer not null check (price_cents >= 0),
  cover_emoji text,
  cover_class text,
  access_type text check (access_type in ('vitalicio', 'periodo')),
  access_duration_days integer,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  video_url text,
  duration_seconds integer,
  position integer not null default 0,
  is_free_preview boolean not null default false
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

-- ---------- pedidos e pagamentos ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
  amount_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_payment_id text,
  method text,
  installments integer,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- auditoria e idempotência de webhooks (nunca processar a mesma notificação 2x)
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercadopago',
  event_id text not null,
  payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- ---------- matrícula e progresso ----------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  order_id uuid references public.orders(id),
  expires_at timestamptz, -- null = acesso vitalício
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  seconds_watched integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- helper: o usuário atual tem acesso válido a este produto?
create or replace function public.has_access(p_product_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid()
      and product_id = p_product_id
      and (expires_at is null or expires_at > now())
  );
$$;

-- ---------- cupons ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent integer check (discount_percent between 1 and 100),
  valid_until timestamptz,
  active boolean not null default true
);

-- ---------- lista de espera (Fase 2 — migra do arquivo local) ----------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  product_slug text not null,
  created_at timestamptz not null default now()
);

-- ---------- configurações / credenciais ----------
-- Onde ficam as chaves que você cola pelo painel admin (Mercado Pago etc).
-- Só é acessível pelo servidor (service role) — nunca pelo navegador.
create table if not exists public.app_settings (
  key text primary key,
  value text,
  is_secret boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.coupons enable row level security;
alter table public.waitlist enable row level security;
alter table public.app_settings enable row level security;

-- profiles: cada um vê e edita o próprio; admin vê todos
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- products: público vê só publicados; admin vê e edita tudo
create policy "products_select_published" on public.products
  for select using (published = true or public.is_admin());
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- modules/lessons: visível para quem tem acesso ao curso, aula grátis, ou admin
create policy "modules_select_access" on public.modules
  for select using (public.has_access(product_id) or public.is_admin());
create policy "modules_admin_write" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons_select_access" on public.lessons
  for select using (
    is_free_preview = true
    or public.is_admin()
    or exists (
      select 1 from public.modules m
      where m.id = module_id and public.has_access(m.product_id)
    )
  );
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "materials_select_access" on public.materials
  for select using (public.has_access(product_id) or public.is_admin());
create policy "materials_admin_write" on public.materials
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: cada um vê os próprios; ninguém insere/edita direto (só o servidor,
-- via service role, no fluxo de checkout e no webhook)
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- payments: só admin (auditoria); gravação é sempre via service role
create policy "payments_select_admin" on public.payments
  for select using (public.is_admin());

-- webhook_events: só admin (auditoria)
create policy "webhook_events_select_admin" on public.webhook_events
  for select using (public.is_admin());

-- enrollments: cada um vê as próprias; gravação só via service role (após pagamento)
create policy "enrollments_select_own_or_admin" on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());

-- progress: cada um vê e grava o próprio progresso (não é dado sensível)
create policy "progress_all_own" on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- coupons: público vê só os ativos (para validar no checkout); admin edita
create policy "coupons_select_active" on public.coupons
  for select using (active = true or public.is_admin());
create policy "coupons_admin_write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- waitlist: qualquer um pode se inscrever; só admin lê a lista
create policy "waitlist_insert_anyone" on public.waitlist
  for insert with check (true);
create policy "waitlist_select_admin" on public.waitlist
  for select using (public.is_admin());

-- app_settings: SEM policy nenhuma para anon/authenticated —
-- só o service role (usado exclusivamente em código de servidor) acessa.
-- Isso é intencional: chaves de API nunca passam por uma política de RLS
-- que um usuário logado possa, por engano, acabar exercitando.

-- ============================================================
-- SEED — catálogo inicial (mesmo conteúdo do lib/catalog.js)
-- ============================================================
insert into public.products (slug, type, title, tagline, short_description, description, price_cents, cover_emoji, cover_class, access_type, published)
values
  ('bolsa-tote-croche', 'produto', 'Bolsa Tote Crochê', 'Verão 25',
   'Bolsa tote feita à mão em crochê, algodão 100% natural.',
   'Peça feita à mão em crochê, com fio 100% algodão natural. Estrutura firme para o dia a dia, alças reforçadas e acabamento artesanal em cada carreira de pontos.',
   18900, '🧶', 'product-img--tote', null, true),
  ('vestido-linho-croche', 'produto', 'Vestido Linho Crochê', 'Sob Medida',
   'Vestido em linho com detalhes em crochê, sob medida.',
   'Vestido construído sob medida a partir das suas medidas — tecido de linho leve combinado com painéis de crochê feitos à mão.',
   48000, '🌿', 'product-img--vestido', null, true),
  ('top-rendado-natural', 'produto', 'Top Rendado Natural', 'Edição Limitada',
   'Top rendado em crochê, edição limitada.',
   'Top com renda de crochê trabalhada à mão, em edição limitada — poucas peças por lote.',
   22000, '🤍', 'product-img--top', null, true),
  ('curso-croche-iniciantes', 'curso', 'Crochê para Iniciantes', 'Curso Online',
   'Aprenda os pontos base do crochê e crie sua primeira peça.',
   'Curso gravado, para assistir quando quiser: do ponto baixo ao ponto alto, leitura de gráficos e o passo a passo completo para criar sua primeira peça em crochê.',
   4990, '🧵', 'product-img--tote', 'vitalicio', true)
on conflict (slug) do nothing;
