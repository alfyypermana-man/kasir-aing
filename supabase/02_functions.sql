-- =========================================================
-- SUPERHOLIC CASHIER - FUNCTIONS
-- Jalankan SETELAH 01_schema.sql
-- =========================================================

-- =========================================================
-- Generate invoice number: INV-YYYYMMDD-0001
-- Menggunakan invoice_sequences + row lock agar tidak duplicate
-- meskipun ada banyak transaksi bersamaan.
-- =========================================================
create or replace function generate_invoice_number()
returns text as $$
declare
  v_date_key text := to_char(now(), 'YYYYMMDD');
  v_seq integer;
begin
  insert into invoice_sequences (date_key, last_seq)
  values (v_date_key, 1)
  on conflict (date_key)
  do update set last_seq = invoice_sequences.last_seq + 1
  returning last_seq into v_seq;

  return 'INV-' || v_date_key || '-' || lpad(v_seq::text, 4, '0');
end;
$$ language plpgsql;

-- =========================================================
-- Atomic checkout: buat transaksi + items + payment,
-- kurangi stok, catat inventory movement, semuanya dalam
-- satu transaction database (all-or-nothing).
--
-- p_items adalah jsonb array: [{product_id, quantity, price, discount}]
-- =========================================================
create or replace function checkout_transaction(
  p_cashier_id uuid,
  p_items jsonb,
  p_subtotal numeric,
  p_discount numeric,
  p_discount_id uuid,
  p_total numeric,
  p_payment_method text,
  p_cash_received numeric,
  p_change numeric
)
returns transactions
language plpgsql
security definer
as $$
declare
  v_invoice text;
  v_transaction transactions;
  v_item jsonb;
  v_product products;
  v_line_subtotal numeric;
  v_status text := 'PAID';
begin
  if p_payment_method not in ('TUNAI', 'QR_CODE') then
    raise exception 'Metode pembayaran tidak valid';
  end if;

  if p_payment_method = 'TUNAI' then
    if p_cash_received is null or p_cash_received < p_total then
      raise exception 'Uang pembayaran tidak cukup.';
    end if;
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong.';
  end if;

  v_invoice := generate_invoice_number();

  insert into transactions (
    invoice_number, cashier_id, subtotal, discount, discount_id, total,
    payment_method, cash_received, change_amount, payment_status, transaction_status
  ) values (
    v_invoice, p_cashier_id, p_subtotal, p_discount, p_discount_id, p_total,
    p_payment_method, p_cash_received, p_change, v_status, v_status
  )
  returning * into v_transaction;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- lock product row to prevent race conditions on stock
    select * into v_product
    from products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null then
      raise exception 'Produk tidak ditemukan: %', (v_item->>'product_id');
    end if;

    if v_product.stock < (v_item->>'quantity')::integer then
      raise exception 'Stok tidak cukup untuk produk: %', v_product.name;
    end if;

    v_line_subtotal := (v_item->>'price')::numeric * (v_item->>'quantity')::integer
                        - coalesce((v_item->>'discount')::numeric, 0);

    insert into transaction_items (
      transaction_id, product_id, product_name_snapshot, price_snapshot,
      quantity, discount, subtotal
    ) values (
      v_transaction.id, v_product.id, v_product.name, (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer, coalesce((v_item->>'discount')::numeric, 0),
      v_line_subtotal
    );

    -- kurangi stok (guarded by check constraint stock >= 0 as a safety net)
    update products
    set stock = stock - (v_item->>'quantity')::integer
    where id = v_product.id;

    insert into inventory_movements (
      product_id, type, quantity, note, reference_transaction_id, created_by
    ) values (
      v_product.id, 'SALE', -1 * (v_item->>'quantity')::integer,
      'Penjualan ' || v_invoice, v_transaction.id, p_cashier_id
    );
  end loop;

  insert into payments (
    transaction_id, method, amount, cash_received, change_amount, status
  ) values (
    v_transaction.id, p_payment_method, p_total, p_cash_received, p_change, 'PAID'
  );

  return v_transaction;
end;
$$;

-- =========================================================
-- Manual stock adjustment (Admin only, enforced by RLS +
-- also re-checked here). Records a movement and updates stock
-- atomically.
-- =========================================================
create or replace function adjust_stock(
  p_product_id uuid,
  p_type text,
  p_quantity integer,
  p_note text
)
returns products
language plpgsql
security definer
as $$
declare
  v_role text;
  v_delta integer;
  v_product products;
begin
  select role into v_role from profiles where id = auth.uid();
  if v_role is distinct from 'ADMIN' then
    raise exception 'Hanya Admin yang dapat mengubah stok.';
  end if;

  if p_type not in ('OPENING', 'IN', 'OUT', 'ADJUSTMENT') then
    raise exception 'Tipe pergerakan stok tidak valid.';
  end if;

  v_delta := case when p_type = 'OUT' then -1 * abs(p_quantity) else abs(p_quantity) end;

  update products
  set stock = stock + v_delta
  where id = p_product_id
  returning * into v_product;

  if v_product.id is null then
    raise exception 'Produk tidak ditemukan.';
  end if;

  if v_product.stock < 0 then
    raise exception 'Stok tidak boleh negatif.';
  end if;

  insert into inventory_movements (product_id, type, quantity, note, created_by)
  values (p_product_id, p_type, v_delta, p_note, auth.uid());

  return v_product;
end;
$$;
