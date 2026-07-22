-- 1. Buat tabel profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  last_username_change TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat tabel username_history
CREATE TABLE IF NOT EXISTS public.username_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_username TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Atur Row Level Security (RLS) untuk profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Publik bisa melihat profil siapa saja (misal untuk chat / review)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- User hanya bisa mengupdate profilnya sendiri
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Atur Row Level Security (RLS) untuk username_history
ALTER TABLE public.username_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own history" ON public.username_history;
CREATE POLICY "Users can view own history" 
ON public.username_history FOR SELECT USING (auth.uid() = user_id);

-- Cegah user memanipulasi histori mereka sendiri via client
DROP POLICY IF EXISTS "Prevent client insert on username_history" ON public.username_history;
CREATE POLICY "Prevent client insert on username_history" 
ON public.username_history FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "Prevent client update on username_history" ON public.username_history;
CREATE POLICY "Prevent client update on username_history" 
ON public.username_history FOR UPDATE WITH CHECK (false);
DROP POLICY IF EXISTS "Prevent client delete on username_history" ON public.username_history;
CREATE POLICY "Prevent client delete on username_history" 
ON public.username_history FOR DELETE USING (false);

-- 5. Fungsi Trigger: Buat profil otomatis saat ada user baru
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Fungsi Trigger: Validasi perubahan Username
CREATE OR REPLACE FUNCTION public.validate_username_change()
RETURNS TRIGGER AS $$
DECLARE
  -- Tambahkan kata terlarang di sini
  banned_words TEXT[] := ARRAY['admin', 'simoengil', 'official', 'system', 'moderator', 'support'];
  word TEXT;
  days_since_last_change INT;
BEGIN
  -- Jika username TIDAK berubah, abaikan dan update waktu saja
  IF (OLD.username IS NOT DISTINCT FROM NEW.username) THEN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
  END IF;

  -- A. Validasi Karakter (Hanya huruf, angka, underscore, 3-20 karakter)
  IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Username hanya boleh terdiri dari huruf, angka, dan underscore (_), panjang 3-20 karakter.';
  END IF;

  -- B. Validasi Kata Terlarang (Case-insensitive)
  FOREACH word IN ARRAY banned_words
  LOOP
    IF NEW.username ILIKE '%' || word || '%' THEN
      RAISE EXCEPTION 'Username mengandung kata yang dilarang (%).', word;
    END IF;
  END LOOP;

  -- C. Rate Limiting (Hanya boleh 1 kali ganti per 30 hari)
  IF OLD.last_username_change IS NOT NULL THEN
    days_since_last_change := EXTRACT(EPOCH FROM (timezone('utc'::text, now()) - OLD.last_username_change)) / 86400;
    IF days_since_last_change < 30 THEN
      RAISE EXCEPTION 'Anda hanya bisa mengganti username setiap 30 hari sekali. Mohon tunggu % hari lagi.', 30 - days_since_last_change;
    END IF;
  END IF;

  -- Catat waktu perubahan
  NEW.last_username_change = timezone('utc'::text, now());
  NEW.updated_at = timezone('utc'::text, now());

  -- D. Simpan Username Lama ke tabel history
  IF OLD.username IS NOT NULL THEN
    INSERT INTO public.username_history (user_id, old_username)
    VALUES (OLD.id, OLD.username);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger validasi username
DROP TRIGGER IF EXISTS check_username_change ON public.profiles;
CREATE TRIGGER check_username_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.validate_username_change();
