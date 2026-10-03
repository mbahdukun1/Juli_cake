create table if not exists public.products (
  id          text primary key,
  name        text not null,
  category    text not null default 'cake',
  description text not null default '',
  story       text not null default '',
  emoji       text not null default '🍰',
  tint        text not null default '#F4DBD4',
  tint_deep   text not null default '#E3B0A2',
  images      text[] not null default '{}',
  variants    jsonb not null default '[]',
  badge       text,
  servings    text not null default '',
  ready_in    text not null default '',
  lead_days   int  not null default 0,
  storage     text not null default '',
  ingredients text[] not null default '{}',
  allergens   text[] not null default '{}',
  is_active   boolean not null default true,
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

drop policy if exists "publik baca menu aktif" on public.products;
create policy "publik baca menu aktif" on public.products
  for select to anon using (is_active);

drop policy if exists "admin kelola menu" on public.products;
create policy "admin kelola menu" on public.products
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif'])
on conflict (id) do update set public = true;

drop policy if exists "admin unggah foto" on storage.objects;
create policy "admin unggah foto" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "admin ubah foto" on storage.objects;
create policy "admin ubah foto" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "admin hapus foto" on storage.objects;
create policy "admin hapus foto" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

drop policy if exists "admin lihat daftar foto" on storage.objects;
create policy "admin lihat daftar foto" on storage.objects
  for select to authenticated using (bucket_id = 'product-images');
