-- ==========================================
-- HISTÓRICO DE PEDIDOS + FAVORITOS - VERSÃO CORRIGIDA
-- Pizzaria Ramos - Sistema de Delivery
-- ==========================================

-- PRIMEIRO: Limpar tudo caso já exista (CUIDADO: apaga dados!)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS set_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;

-- 1. TABELA DE PEDIDOS (ORDERS)
-- ==========================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE,
    
    -- Dados do cliente
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    
    -- Dados do pedido
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Forma de pagamento
    payment_method VARCHAR(50) NOT NULL,
    payment_change DECIMAL(10, 2),
    
    -- Agendamento
    scheduled_delivery BOOLEAN DEFAULT false,
    delivery_date DATE,
    delivery_time TIME,
    
    -- Status do pedido
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Observações
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimizar queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Função para gerar número único de pedido (formato: PZ-2026-0001)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part INT;
    order_num VARCHAR(20);
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::VARCHAR;
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 9) AS INT)
    ), 0) + 1 INTO sequence_part
    FROM orders
    WHERE order_number LIKE 'PZ-' || year_part || '-%';
    
    order_num := 'PZ-' || year_part || '-' || LPAD(sequence_part::VARCHAR, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-gerar número do pedido
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();


-- 2. TABELA DE FAVORITOS (FAVORITES)
-- ==========================================
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- Índices para otimizar queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- RLS (Row Level Security) - VERSÃO SIMPLIFICADA
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para ORDERS - Versão permissiva para testes
-- DEPOIS você pode restringir mais
CREATE POLICY "Enable read for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
    FOR UPDATE USING (true);

-- Políticas para FAVORITES - Versão permissiva para testes
CREATE POLICY "Enable read for all users" ON favorites
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON favorites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON favorites
    FOR DELETE USING (true);

-- Comentários
COMMENT ON TABLE orders IS 'Armazena todos os pedidos realizados pelos clientes';
COMMENT ON TABLE favorites IS 'Produtos marcados como favoritos pelos usuários';
COMMENT ON COLUMN orders.order_number IS 'Número único do pedido gerado automaticamente (PZ-2026-0001)';
COMMENT ON COLUMN orders.items IS 'Array JSON com todos os itens do pedido';
COMMENT ON COLUMN orders.status IS 'Status atual: pending, preparing, delivering, delivered, cancelled';
