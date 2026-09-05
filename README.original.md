# SuperHolic Cashier — Elegant Point of Sale

Aplikasi Point of Sale (POS) / Kasir berbasis **React + Vite + Tailwind CSS + Supabase**, siap dikembangkan dan di-deploy ke Vercel.

Fitur utama: multi-role (ADMIN/KASIR) dengan RLS di database, manajemen produk & kategori, inventory & stok, diskon, POS dengan scan barcode/QR, pembayaran Tunai & QR Code toko, struk (print/PDF/WhatsApp), dashboard & laporan, dark mode, dan tampilan responsive mobile-first (sidebar di desktop, hamburger + bottom navigation di HP).

> ⚠️ Project ini **tidak** membuat/mengonfigurasi Supabase atau melakukan deploy secara otomatis. Anda perlu mengikuti langkah-langkah di bawah dengan project Supabase & Vercel milik Anda sendiri.

---

## 1. Persiapan

- Install [Node.js](https://nodejs.org/) versi 18 ke atas.
- Punya akun [Supabase](https://supabase.com/) (gratis) dan [Vercel](https://vercel.com/) (gratis).

## 2. Clone & install dependency

```bash
git clone <url-repo-anda>
cd cashier-elegant
npm install
```

## 3. Buat project Supabase

1. Buka [supabase.com](https://supabase.com/) → **New Project**.
2. Catat **Project URL** dan **anon public key** (Settings → API). Anda akan membutuhkannya di langkah 6.

## 4. Jalankan SQL database

Buka **SQL Editor** di dashboard Supabase, lalu jalankan file-file berikut **secara berurutan** (copy-paste isi tiap file, klik Run):

1. `supabase/01_schema.sql` — membuat semua tabel, index, constraint, dan trigger.
2. `supabase/02_functions.sql` — fungsi `generate_invoice_number`, `checkout_transaction` (transaksi atomic: simpan transaksi + item + payment + kurangi stok + catat inventory movement dalam satu operasi database, mencegah stok negatif & duplicate), dan `adjust_stock`.
3. `supabase/03_rls_policies.sql` — mengaktifkan Row Level Security dan membuat semua policy akses berbasis role (ADMIN/KASIR) **langsung di database**, bukan hanya di frontend.
4. `supabase/04_storage_policies.sql` — policy akses Storage (jalankan **setelah** membuat bucket di langkah 5).

## 5. Buat Supabase Storage

Di dashboard Supabase → **Storage** → **New bucket**, buat 3 bucket berikut, masing-masing sebagai **Public bucket**:

- `product-images`
- `avatars`
- `store-assets`

Setelah ketiga bucket dibuat, jalankan `supabase/04_storage_policies.sql` di SQL Editor untuk mengatur siapa yang boleh upload/ubah/hapus file di masing-masing bucket.

## 6. Buat akun Admin pertama

1. Di dashboard Supabase → **Authentication → Users → Add user**, buat satu user (email + password) untuk Admin.
2. Trigger database otomatis membuat baris di tabel `profiles` dengan role default `KASIR`. Jadikan user ini Admin dengan menjalankan di SQL Editor:

```sql
update profiles set role = 'ADMIN' where email = 'email-admin-anda@example.com';
```

3. Untuk menambah akun Kasir selanjutnya, gunakan menu **User/Kasir** di dalam aplikasi (sebagai Admin) — cara ini tetap memakai Supabase Auth, aplikasi tidak menyimpan password sendiri.

## 7. Environment variable

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi dengan URL & anon key dari langkah 3:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

`.env` **tidak** ikut ter-commit ke GitHub (sudah ada di `.gitignore`). Jangan pernah memasukkan Supabase **Service Role Key** ke project ini.

## 8. Jalankan secara lokal

```bash
npm run dev
```

Buka `http://localhost:5173`, login dengan akun Admin dari langkah 6.

Untuk build production:

```bash
npm run build
npm run preview
```

## 9. Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: SuperHolic Cashier"
git branch -M main
git remote add origin <url-repo-github-anda>
git push -u origin main
```

## 10. Deploy ke Vercel

1. Login ke [vercel.com](https://vercel.com/) → **Add New Project** → Import repository GitHub Anda.
2. Framework preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Klik **Deploy**.

Aplikasi akan berjalan di `nama-project.vercel.app`. Custom domain bisa ditambahkan kapan saja lewat Vercel dashboard.

---

## Struktur Project

```
src/
├── components/     # Komponen reusable (layout, POS, ProtectedRoute)
├── layouts/        # AdminLayout & CashierLayout (sidebar, navbar, bottom nav)
├── pages/          # Halaman per role (admin/, cashier/, shared/)
├── services/       # Fungsi akses Supabase per domain (products, transactions, dst)
├── hooks/          # Custom hooks
├── contexts/       # AuthContext, CartContext, ThemeContext
├── utils/          # Formatter, barcode, invoice helper, PDF, WhatsApp
└── supabase.js     # Supabase client

supabase/
├── 01_schema.sql           # Tabel, index, constraint, trigger
├── 02_functions.sql        # generate_invoice_number, checkout_transaction, adjust_stock
├── 03_rls_policies.sql     # Row Level Security per role
└── 04_storage_policies.sql # Policy Storage bucket
```

## Role & Hak Akses

| Fitur | ADMIN | KASIR |
|---|---|---|
| Dashboard & Laporan Toko | ✅ | ❌ |
| Kelola Produk / Kategori / Stok / Diskon | ✅ | ❌ |
| Kelola User/Kasir & Pengaturan Toko | ✅ | ❌ |
| Semua Transaksi Toko | ✅ | ❌ (hanya transaksi sendiri) |
| POS (jual barang, scan, bayar Tunai/QR) | ✅ | ✅ |
| Cetak Struk / PDF / WhatsApp | ✅ | ✅ |
| Edit Profil Sendiri | ✅ | ✅ |

Pembatasan akses ini ditegakkan **dua lapis**: di frontend (routing & UI) dan di database lewat **Row Level Security (RLS)** Supabase, sehingga Kasir tidak bisa mengakses data Admin meski mencoba memanggil API secara langsung.

## Catatan Keamanan

- Transaksi dibuat lewat satu fungsi database (`checkout_transaction`) agar simpan transaksi, kurangi stok, dan catat pergerakan inventory terjadi atomic — mencegah stok negatif, transaksi ganda, dan pengurangan stok dua kali.
- Metode pembayaran QR Code memakai QR statis milik toko (diunggah Admin di Pengaturan Toko) — **bukan** payment gateway. Konfirmasi pembayaran dilakukan manual oleh kasir setelah customer membayar.
- Kirim struk WhatsApp menggunakan WhatsApp deep link (`wa.me`), bukan WhatsApp Business API berbayar.

## Lisensi

Bebas digunakan dan dimodifikasi sesuai kebutuhan toko Anda.
