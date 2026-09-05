-- =========================================================
-- SUPERHOLIC CASHIER - DATABASE SCHEMA
-- Jalankan file ini di Supabase SQL Editor (project Anda sendiri)
-- Urutan eksekusi: 01_schema.sql -> 02_functions.sql
--                   -> 03_rls_policies.sql -> 04_storage_policies.sql
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =========================================================
-- 1. PROFILES (linked to auth.users)
-- =========================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'KASIR' check (role in ('ADMIN', 'KASIR')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_email_idx on profiles(email);

-- =========================================================
-- 2. CATEGORIES
-- =========================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

-- =========================================================
-- 3. PRODUCTS
-- =========================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  barcode text unique,
  qr_code text unique,
  product_code text unique,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  cost_price numeric(14,2) not null default 0 check (cost_price >= 0),
  selling_price numeric(14,2) not null check (selling_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  unit text not null default 'pcs',
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_name_idx on products using gin (to_tsvector('simple', name));
create index if not exists products_category_idx on products(category_id);
create index if not exists products_status_idx on products(status);

-- =========================================================
-- 4. INVENTORY (current snapshot lives on products.stock;
--    this table stores per-product settings/reference only)
-- =========================================================
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  location text default 'MAIN',
  updated_at timestamptz not null default now(),
  unique (product_id, location)
);

-- =========================================================
-- 5. INVENTORY MOVEMENTS
-- =========================================================
create table if not exists inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('OPENING', 'IN', 'OUT', 'ADJUSTMENT', 'SALE')),
  quantity integer not null,
  note text,
  reference_transaction_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_product_idx on inventory_movements(product_id);
create index if not exists inventory_movements_created_idx on inventory_movements(created_at);

-- =========================================================
-- 6. DISCOUNTS
-- =========================================================
create table if not exists discounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('PERCENT', 'NOMINAL')),
  value numeric(14,2) not null check (value >= 0),
  scope text not null default 'ALL' check (scope in ('PRODUCT', 'CATEGORY', 'ALL')),
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  minimum_purchase numeric(14,2) default 0,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- =========================================================
-- 7. TRANSACTIONS
-- =========================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  cashier_id uuid references profiles(id),
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  discount_id uuid references discounts(id),
  total numeric(14,2) not null default 0,
  payment_method text not null check (payment_method in ('TUNAI', 'QR_CODE')),
  cash_received numeric(14,2),
  change_amount numeric(14,2),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'CANCELLED')),
  transaction_status text not null default 'PENDING' check (transaction_status in ('PENDING', 'PAID', 'CANCELLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transactions_cashier_idx on transactions(cashier_id);
create index if not exists transactions_created_idx on transactions(created_at);
create index if not exists transactions_status_idx on transactions(transaction_status);

-- Sequence helper table to build INV-YYYYMMDD-0001 safely
create table if not exists invoice_sequences (
  date_key text primary key,
  last_seq integer not null default 0
);

-- =========================================================
-- 8. TRANSACTION ITEMS (snapshot pricing/name)
-- =========================================================
create table if not exists transaction_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  price_snapshot numeric(14,2) not null,
  quantity integer not null check (quantity > 0),
  discount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists transaction_items_tx_idx on transaction_items(transaction_id);

-- =========================================================
-- 9. PAYMENTS
-- =========================================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  method text not null check (method in ('TUNAI', 'QR_CODE')),
  amount numeric(14,2) not null,
  cash_received numeric(14,2),
  change_amount numeric(14,2),
  status text not null default 'PAID' check (status in ('PENDING', 'PAID', 'FAILED')),
  created_at timestamptz not null default now()
);
create index if not exists payments_tx_idx on payments(transaction_id);

-- =========================================================
-- 10. STORE SETTINGS (single row)
-- =========================================================
create table if not exists store_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null default 'Toko Saya',
  address text,
  phone text,
  logo_url text,
  receipt_footer text default 'Terima kasih atas kunjungan Anda!',
  receipt_size text not null default '58mm' check (receipt_size in ('58mm', '80mm')),
  payment_qr_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed one default settings row (safe to run once)
insert into store_settings (store_name)
select 'Toko Saya'
where not exists (select 1 from store_settings);

-- =========================================================
-- Trigger: keep updated_at fresh
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_categories_updated on categories;
create trigger trg_categories_updated before update on categories
  for each row execute function set_updated_at();

drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_discounts_updated on discounts;
create trigger trg_discounts_updated before update on discounts
  for each row execute function set_updated_at();

drop trigger if exists trg_transactions_updated on transactions;
create trigger trg_transactions_updated before update on transactions
  for each row execute function set_updated_at();

drop trigger if exists trg_store_settings_updated on store_settings;
create trigger trg_store_settings_updated before update on store_settings
  for each row execute function set_updated_at();

