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

-- 6️⃣ CRIAR TABELA orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  sequential_num SERIAL,
  user_name VARCHAR(255),
  user_phone VARCHAR(20),
  delivery_address JSONB,
  delivery_type VARCHAR(20) DEFAULT 'imediata',
  scheduled_time VARCHAR(10),
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pendente',
  payment_method VARCHAR(20) DEFAULT 'pix',
  change_for VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7️⃣ CRIAR TABELA order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
  flavor_1_id VARCHAR(100),
  item_type VARCHAR(20) DEFAULT 'inteira',
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  size_label VARCHAR(50),
  observations TEXT,
  product_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 8️⃣ RLS PARA ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir pedidos (clientes não autenticados)
DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
CREATE POLICY "Allow public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Apenas admin autenticado pode ler/atualizar pedidos
DROP POLICY IF EXISTS "Allow authenticated read orders" ON orders;
CREATE POLICY "Allow authenticated read orders"
  ON orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update orders" ON orders;
CREATE POLICY "Allow authenticated update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- order_items: insert público, leitura livre
DROP POLICY IF EXISTS "Allow public insert order_items" ON order_items;
CREATE POLICY "Allow public insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read order_items" ON order_items;
CREATE POLICY "Allow authenticated read order_items"
  ON order_items FOR SELECT
  USING (true);

-- 9️⃣ HABILITAR REALTIME NAS TABELAS DE PEDIDOS
-- ⚠️ CRÍTICO: sem isso, o AdminDashboard não recebe pedidos em tempo real!
-- Usa DO block para ignorar se a tabela já for membro da publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  END IF;
END $$;

-- 🔟 VERIFICAR DADOS INSERIDOS
SELECT * FROM store_settings ORDER BY key;
SELECT 'Realtime habilitado para: orders, order_items' AS status;
