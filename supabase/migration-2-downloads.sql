-- ============================================================
-- MIGRAÇÃO 2 — capa de verdade + cursos como download completo
-- ============================================================
-- Os cursos deixam de ser por módulos/aulas em vídeo streamado.
-- Cada produto/curso agora tem uma imagem de capa e um ou mais
-- arquivos completos para download (vídeo do curso, materiais).

alter table public.products
  add column if not exists cover_image_url text;

create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  storage_path text not null,
  file_size_bytes bigint,
  content_type text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_files enable row level security;

drop policy if exists "product_files_select_access" on public.product_files;
create policy "product_files_select_access" on public.product_files
  for select using (public.has_access(product_id) or public.is_admin());

drop policy if exists "product_files_admin_write" on public.product_files;
create policy "product_files_admin_write" on public.product_files
  for all using (public.is_admin()) with check (public.is_admin());
