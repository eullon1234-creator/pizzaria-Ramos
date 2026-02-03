-- ============================================
-- CONFIGURAÇÃO DE POLÍTICAS DE STORAGE
-- Pizzaria Ramos - Bucket de Imagens
-- ============================================
-- 
-- IMPORTANTE: Execute este script DEPOIS de criar o bucket "images" manualmente
-- no dashboard do Supabase (Storage → New Bucket → Nome: "images" → Public: YES)
--
-- ============================================

-- Limpar políticas existentes (se houver)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

-- ============================================
-- POLÍTICA 1: UPLOAD DE IMAGENS
-- Permite que usuários autenticados façam upload
-- ============================================
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- ============================================
-- POLÍTICA 2: DELETAR IMAGENS
-- Permite que usuários autenticados deletem imagens
-- ============================================
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- ============================================
-- POLÍTICA 3: ATUALIZAR IMAGENS
-- Permite que usuários autenticados atualizem imagens
-- ============================================
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- ============================================
-- POLÍTICA 4: VISUALIZAR IMAGENS (PÚBLICO)
-- Permite que qualquer pessoa visualize as imagens
-- Necessário para exibir QR Codes e fotos de produtos
-- ============================================
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- ============================================
-- VERIFICAÇÃO
-- Execute esta query para verificar se as políticas foram criadas
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%images%'
ORDER BY policyname;

-- ============================================
-- RESULTADO ESPERADO:
-- Você deve ver 4 políticas listadas:
-- 1. Authenticated users can upload images (INSERT)
-- 2. Authenticated users can delete images (DELETE)
-- 3. Authenticated users can update images (UPDATE)
-- 4. Public can view images (SELECT)
-- ============================================
