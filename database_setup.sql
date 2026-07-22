-- Hapus semua policy lama (jika ada)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."products";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."products";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."products";
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."products";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."site_settings";
DROP POLICY IF EXISTS "Enable insert/update for authenticated users only" ON "public"."site_settings";


-- 1. Mengatur RLS untuk tabel `products`
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa melihat (Read) data produk
CREATE POLICY "Enable read access for all users"
ON "public"."products"
FOR SELECT
USING (true);

-- Hanya user yang sudah login (Admin) yang bisa menambah produk
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."products"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Hanya user yang sudah login (Admin) yang bisa mengedit produk
CREATE POLICY "Enable update for authenticated users only"
ON "public"."products"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Hanya user yang sudah login (Admin) yang bisa menghapus produk
CREATE POLICY "Enable delete for authenticated users only"
ON "public"."products"
FOR DELETE
USING (auth.role() = 'authenticated');


-- 2. Mengatur RLS untuk tabel `site_settings`
ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa melihat (Read) data site settings
CREATE POLICY "Enable read access for all users"
ON "public"."site_settings"
FOR SELECT
USING (true);

-- Hanya user yang sudah login (Admin) yang bisa insert & update pengaturan
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."site_settings"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON "public"."site_settings"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
