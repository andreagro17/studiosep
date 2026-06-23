-- ============================================================================
-- StudioSeptiembre — Esquema de base de datos (Supabase / PostgreSQL)
-- ============================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar y RUN.
-- Idempotente en lo posible (usa IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- Extensiones ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type availability_type as enum ('made_to_order', 'in_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_type as enum ('stock', 'commission');
exception when duplicate_object then null; end $$;

do $$ begin
  create type production_status as enum (
    'pendiente', 'aceptado', 'en_produccion', 'enviado', 'entregado', 'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type variant_type as enum ('color', 'tamano', 'acabado');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- PERFILES (usuarios admin, extiende auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'admin',  -- 'admin' | 'editor'
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- COLECCIONES
-- ----------------------------------------------------------------------------
create table if not exists public.collections (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  month         date,
  description   text,
  cover_image   text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PRODUCTOS
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  description          text,
  availability_type    availability_type not null,
  price_cents          integer not null check (price_cents >= 0),
  currency             text not null default 'EUR',
  production_time_days integer,                 -- solo made_to_order
  stock_quantity       integer,                 -- solo in_stock
  collection_id        uuid references public.collections (id) on delete set null,
  is_featured          boolean not null default false,
  is_published         boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists products_collection_idx on public.products (collection_id);
create index if not exists products_published_idx  on public.products (is_published);

-- ----------------------------------------------------------------------------
-- VARIANTES DE PRODUCTO
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  type              variant_type not null,
  label             text not null,
  price_delta_cents integer not null default 0,
  stock_quantity    integer,
  position          integer not null default 0
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

-- ----------------------------------------------------------------------------
-- IMÁGENES DE PRODUCTO
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  storage_path text not null,          -- ruta en el bucket 'products'
  alt          text,
  position     integer not null default 0,
  is_primary   boolean not null default false
);
create index if not exists product_images_product_idx on public.product_images (product_id);

-- ----------------------------------------------------------------------------
-- DIMENSIONES DE PRODUCTO
-- ----------------------------------------------------------------------------
create table if not exists public.product_dimensions (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label      text not null,            -- "Altura", "Ø"…
  value_cm   numeric not null
);
create index if not exists product_dimensions_product_idx on public.product_dimensions (product_id);

-- ----------------------------------------------------------------------------
-- CLIENTES
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  phone      text,
  address    text,
  notes      text,
  created_at timestamptz not null default now()
);
create index if not exists customers_email_idx on public.customers (email);

-- ----------------------------------------------------------------------------
-- PEDIDOS
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SS-' || to_char(now(), 'YYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4)),
  customer_id  uuid references public.customers (id) on delete set null,
  type         order_type not null,
  status       production_status not null default 'pendiente',
  total_cents  integer not null default 0,
  notes        text,
  requested_at timestamptz not null default now(),
  due_date     date
);
create index if not exists orders_status_idx   on public.orders (status);
create index if not exists orders_customer_idx on public.orders (customer_id);

-- ----------------------------------------------------------------------------
-- LÍNEAS DE PEDIDO
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid references public.products (id) on delete set null,
  variant_id       uuid references public.product_variants (id) on delete set null,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null default 0,
  custom_specs     jsonb
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- MENSAJES DE CONTACTO
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at automático en products
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Regla general:
--   • Lectura pública SOLO de contenido publicado.
--   • Escritura (insert/update/delete) SOLO para usuarios autenticados (admin).
--   • orders / customers / inquiries: sin lectura pública.
--   • Las inserciones públicas (pedido/contacto) se harán desde server/api con
--     la service_role key (que ignora RLS), validadas con Zod.
-- ============================================================================

alter table public.profiles          enable row level security;
alter table public.collections       enable row level security;
alter table public.products          enable row level security;
alter table public.product_variants  enable row level security;
alter table public.product_images    enable row level security;
alter table public.product_dimensions enable row level security;
alter table public.customers         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.inquiries         enable row level security;

-- PROFILES: cada usuario ve/edita su propio perfil
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- COLLECTIONS
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections
  for select using (is_published = true);
drop policy if exists collections_admin_all on public.collections;
create policy collections_admin_all on public.collections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCTS
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (is_published = true);
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCT_VARIANTS (lectura pública si el producto está publicado)
drop policy if exists variants_public_read on public.product_variants;
create policy variants_public_read on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
drop policy if exists variants_admin_all on public.product_variants;
create policy variants_admin_all on public.product_variants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCT_IMAGES
drop policy if exists images_public_read on public.product_images;
create policy images_public_read on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
drop policy if exists images_admin_all on public.product_images;
create policy images_admin_all on public.product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCT_DIMENSIONS
drop policy if exists dimensions_public_read on public.product_dimensions;
create policy dimensions_public_read on public.product_dimensions
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
drop policy if exists dimensions_admin_all on public.product_dimensions;
create policy dimensions_admin_all on public.product_dimensions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CUSTOMERS / ORDERS / ORDER_ITEMS / INQUIRIES: solo admin autenticado.
-- (Las altas públicas pasan por server/api con service_role, que omite RLS.)
drop policy if exists customers_admin_all on public.customers;
create policy customers_admin_all on public.customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists inquiries_admin_all on public.inquiries;
create policy inquiries_admin_all on public.inquiries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE: bucket público de imágenes de producto
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes
drop policy if exists products_bucket_public_read on storage.objects;
create policy products_bucket_public_read on storage.objects
  for select using (bucket_id = 'products');

-- Subida / borrado solo para autenticados (admin)
drop policy if exists products_bucket_admin_write on storage.objects;
create policy products_bucket_admin_write on storage.objects
  for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
drop policy if exists products_bucket_admin_delete on storage.objects;
create policy products_bucket_admin_delete on storage.objects
  for delete using (bucket_id = 'products' and auth.role() = 'authenticated');

-- ============================================================================
-- FIN DEL ESQUEMA
-- ============================================================================
