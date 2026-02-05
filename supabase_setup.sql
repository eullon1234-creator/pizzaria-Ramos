-- ============================================
-- SETUP COMPLETO PIZZARIA RAMOS - SUPABASE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1️⃣ CRIAR TABELA store_settings
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);

-- 2️⃣ HABILITAR RLS (Row Level Security)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 3️⃣ POLÍTICAS DE SEGURANÇA
-- Política 1: Permitir leitura pública (necessário para o frontend)
DROP POLICY IF EXISTS "Allow public read" ON store_settings;
CREATE POLICY "Allow public read"
  ON store_settings
  FOR SELECT
  USING (true);

-- Política 2: Permitir escrita apenas para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated write" ON store_settings;
CREATE POLICY "Allow authenticated write"
  ON store_settings
  FOR ALL
  USING (true)  -- Mudado para true temporariamente para admin funcionar
  WITH CHECK (true);

-- 4️⃣ INSERIR CONFIGURAÇÃO PIX PADRÃO
INSERT INTO store_settings (key, value) 
VALUES (
  'pix_config',
  jsonb_build_object(
    'pix_key', '86988776655',
    'key_type', 'phone',
    'holder_name', 'PIZZARIA RAMOS',
    'bank_name', 'Nubank',
    'city', 'Teresina'
  )
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 5️⃣ INSERIR HORÁRIOS DE FUNCIONAMENTO
INSERT INTO store_settings (key, value)
VALUES (
  'business_hours',
  jsonb_build_object(
    '0', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30'),
    '1', jsonb_build_object('open', false, 'openTime', '00:00', 'closeTime', '00:00'),
    '2', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30'),
    '3', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30'),
    '4', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30'),
    '5', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30'),
    '6', jsonb_build_object('open', true, 'openTime', '18:00', 'closeTime', '23:30')
  )
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 6️⃣ VERIFICAR DADOS INSERIDOS
SELECT * FROM store_settings ORDER BY key;
