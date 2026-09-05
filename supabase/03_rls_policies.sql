-- =========================================================
-- CASHIER ELEGANT - PUBLIC POS (TANPA LOGIN / ADMIN / KASIR)
-- Jalankan setelah 01_schema.sql dan 02_functions.sql
-- =========================================================

-- Aplikasi POS ini tidak memakai Supabase Auth.
-- Karena itu akses publik hanya diberikan untuk data yang memang
-- dibutuhkan layar kasir. Pengelolaan produk tetap dilakukan dari
-- Supabase Table Editor / SQL Editor.

alter table categories enable row level security;
alter table products enable row level security;
alter table discounts enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table payments enable row level security;
alter table store_settings enable row level security;
alter table inventory enable row level security;
alter table inventory_movements enable row level security;
alter table invoice_sequences enable row level security;

-- Hapus policy lama yang mungkin berasal dari versi login/admin.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname='public'
    and tablename in ('profiles','categories','products','discounts','transactions','transaction_items','payments','store_settings','inventory','inventory_movements','invoice_sequences')
  loop execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

-- Data POS yang boleh dibaca tanpa login.
create policy "public_read_categories" on categories for select to anon, authenticated using (status = 'active');
create policy "public_read_products" on products for select to anon, authenticated using (status = 'active');
create policy "public_read_discounts" on discounts for select to anon, authenticated using (status = 'active');
create policy "public_read_store_settings" on store_settings for select to anon, authenticated using (true);

-- Riwayat transaksi dibaca aplikasi untuk mencetak struk setelah checkout.
create policy "public_read_transactions" on transactions for select to anon, authenticated using (true);
create policy "public_read_transaction_items" on transaction_items for select to anon, authenticated using (true);
create policy "public_read_payments" on payments for select to anon, authenticated using (true);

-- Tidak ada insert/update/delete langsung dari browser.
create policy "no_direct_product_write" on products for all to anon, authenticated using (false) with check (false);
create policy "no_direct_category_write" on categories for all to anon, authenticated using (false) with check (false);
create policy "no_direct_discount_write" on discounts for all to anon, authenticated using (false) with check (false);
create policy "no_direct_transaction_write" on transactions for all to anon, authenticated using (false) with check (false);
create policy "no_direct_transaction_item_write" on transaction_items for all to anon, authenticated using (false) with check (false);
create policy "no_direct_payment_write" on payments for all to anon, authenticated using (false) with check (false);

-- RPC checkout adalah satu-satunya cara browser membuat transaksi.
revoke all on function checkout_transaction(uuid, jsonb, numeric, numeric, uuid, numeric, text, numeric, numeric) from public;
grant execute on function checkout_transaction(uuid, jsonb, numeric, numeric, uuid, numeric, text, numeric, numeric) to anon, authenticated;

-- Data internal tidak dapat dibaca langsung oleh browser.
create policy "no_public_inventory" on inventory for all to anon, authenticated using (false) with check (false);
create policy "no_public_inventory_movements" on inventory_movements for all to anon, authenticated using (false) with check (false);
create policy "no_public_invoice_sequences" on invoice_sequences for all to anon, authenticated using (false) with check (false);
