# Cashier Elegant - Public POS

Versi ini sengaja dibuat **tanpa login, tanpa role ADMIN, dan tanpa role KASIR**.
Aplikasi langsung membuka halaman POS.

## Supabase
1. Jalankan `supabase/01_schema.sql`.
2. Jalankan `supabase/02_functions.sql`.
3. Jalankan `supabase/03_rls_policies.sql`.
4. Masukkan produk/kategori/stok melalui Supabase Table Editor atau SQL Editor.

## Vercel / GitHub
Buat environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Lalu `npm install` dan `npm run dev`, atau deploy repository GitHub ke Vercel.

Catatan: karena tidak ada login, siapa pun yang memiliki URL aplikasi dapat melakukan transaksi. Data produk tidak dapat diubah dari aplikasi, hanya melalui Supabase.
