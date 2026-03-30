-- ============================================================
-- ShopMate — Agregar campos opcionales al perfil de usuario
-- ============================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Añadir campo phone (opcional)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Añadir campo bio (opcional, para descripción personal)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Verificar resultado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================
-- SUPABASE STORAGE: Crear bucket para avatares
-- ============================================================
-- Ve a: Supabase Dashboard → Storage → New Bucket
-- Nombre: "avatars"
-- Public: ✅ (activar)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 2MB
-- ============================================================
-- O ejecuta esto si tienes acceso a la API de Storage via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Cualquier usuario autenticado puede subir su propio avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
