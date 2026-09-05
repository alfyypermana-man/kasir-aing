-- =========================================================
-- SUPERHOLIC CASHIER - STORAGE POLICIES
-- Jalankan SETELAH membuat bucket berikut di Supabase Dashboard
-- (Storage > New bucket), set masing-masing sebagai PUBLIC bucket:
--   1. product-images
--   2. avatars
--   3. store-assets
--
-- Lalu jalankan file ini di SQL Editor.
-- =========================================================

-- Semua bucket bersifat public untuk READ (agar foto produk, avatar,
-- logo toko, dan QR pembayaran bisa langsung ditampilkan via URL),
-- tapi WRITE (upload/update/delete) dibatasi sesuai role.

-- ---------------------------------------------------------
-- product-images: hanya ADMIN yang boleh upload/ubah/hapus
-- ---------------------------------------------------------
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

-- ---------------------------------------------------------
-- avatars: setiap user (ADMIN/KASIR) hanya boleh upload/ubah/hapus
-- file miliknya sendiri. Konvensi path: avatars/{user_id}/xxx.jpg
-- ---------------------------------------------------------
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------
-- store-assets (logo toko, QR pembayaran): hanya ADMIN
-- ---------------------------------------------------------
drop policy if exists "store_assets_public_read" on storage.objects;
create policy "store_assets_public_read" on storage.objects
  for select using (bucket_id = 'store-assets');

drop policy if exists "store_assets_admin_insert" on storage.objects;
create policy "store_assets_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'store-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

drop policy if exists "store_assets_admin_update" on storage.objects;
create policy "store_assets_admin_update" on storage.objects
  for update using (
    bucket_id = 'store-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

drop policy if exists "store_assets_admin_delete" on storage.objects;
create policy "store_assets_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'store-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );
