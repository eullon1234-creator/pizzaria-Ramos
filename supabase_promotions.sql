-- ==========================================
-- SISTEMA DE PROMOÇÕES GERENCIADO PELO ADMIN
-- Copie TODO este arquivo e execute no Supabase
-- ==========================================

-- 1️⃣ Criar tabela de promoções
CREATE TABLE IF NOT EXISTS promotions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- 2️⃣ Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_promotions_product_id ON promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active) WHERE is_active = true;

-- 3️⃣ Ativar segurança RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Políticas de segurança
-- Permitir leitura pública (clientes veem promoções)
CREATE POLICY "Permitir leitura pública de promoções"
ON promotions FOR SELECT
USING (true);

-- Permitir admin criar promoções
CREATE POLICY "Admin pode criar promoções"
ON promotions FOR INSERT
WITH CHECK (true);

-- Permitir admin atualizar promoções
CREATE POLICY "Admin pode atualizar promoções"
ON promotions FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir admin deletar promoções
CREATE POLICY "Admin pode deletar promoções"
ON promotions FOR DELETE
USING (true);

-- 5️⃣ Função para desativar promoções expiradas automaticamente
CREATE OR REPLACE FUNCTION deactivate_expired_promotions()
RETURNS void AS $$
BEGIN
    UPDATE promotions
    SET is_active = false
    WHERE is_active = true
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- 6️⃣ Comentários
COMMENT ON TABLE promotions IS 'Promoções ativas configuradas pelo admin';
COMMENT ON COLUMN promotions.discount_percentage IS 'Percentual de desconto (1-100)';
COMMENT ON COLUMN promotions.start_date IS 'Data/hora de início da promoção';
COMMENT ON COLUMN promotions.end_date IS 'Data/hora de término da promoção';
COMMENT ON COLUMN promotions.is_active IS 'Se a promoção está ativa (desativa automaticamente após end_date)';
COMMENT ON COLUMN promotions.created_by IS 'Nome do admin que criou a promoção';

-- ==========================================
-- ✅ PRONTO!
-- Tabela promotions criada
-- Sistema automático de expiração
-- Políticas RLS configuradas
-- ==========================================

-- 📌 EXEMPLO DE USO:
-- Colocar Pizza Calabresa com 20% de desconto por 7 dias:
-- INSERT INTO promotions (product_id, discount_percentage, end_date, created_by)
-- VALUES (1, 20, NOW() + INTERVAL '7 days', 'Admin');
