-- ==========================================
-- HISTÓRICO DE PEDIDOS + FAVORITOS
-- Pizzaria Ramos - Sistema de Delivery
-- ==========================================

-- 1. TABELA DE PEDIDOS (ORDERS)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Dados do cliente
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    
    -- Dados do pedido
    items JSONB NOT NULL, -- Array de produtos [{ name, size, price, quantity }]
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Forma de pagamento
    payment_method VARCHAR(50) NOT NULL, -- 'pix', 'dinheiro', 'cartao'
    payment_change DECIMAL(10, 2), -- Troco (se pagamento = dinheiro)
    
    -- Agendamento
    scheduled_delivery BOOLEAN DEFAULT false,
    delivery_date DATE,
    delivery_time TIME,
    
    -- Status do pedido
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'preparing', 'delivering', 'delivered', 'cancelled'
    
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
    
    -- Buscar o último número do ano atual
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 9) AS INT)
    ), 0) + 1 INTO sequence_part
    FROM orders
    WHERE order_number LIKE 'PZ-' || year_part || '-%';
    
    -- Formatar: PZ-2026-0001
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
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que usuário não favorite mesmo produto 2x
    UNIQUE(user_id, product_id)
);

-- Índices para otimizar queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- RLS (Row Level Security) - Segurança
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para ORDERS (usuários veem apenas seus pedidos)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Admin pode ver todos os pedidos
CREATE POLICY "Admin can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text AND is_admin = true
        )
    );

-- Admin pode atualizar status
CREATE POLICY "Admin can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text AND is_admin = true
        )
    );

-- Políticas para FAVORITES (usuários gerenciam apenas seus favoritos)
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid()::text = user_id::text);


-- 3. DADOS DE TESTE (OPCIONAL)
-- ==========================================
-- Inserir pedido de teste (substitua user_id pelo ID real do seu usuário)
/*
INSERT INTO orders (
    user_id, 
    customer_name, 
    customer_phone, 
    customer_address,
    items,
    total_amount,
    payment_method,
    status
) VALUES (
    1, -- Substitua pelo ID do usuário
    'João Silva',
    '(85) 98888-7777',
    'Rua das Flores, 123 - Centro',
    '[
        {"name": "Pizza Calabresa", "size": "G", "price": 45.00, "quantity": 2},
        {"name": "Refrigerante 2L", "size": "2L", "price": 10.00, "quantity": 1}
    ]'::jsonb,
    100.00,
    'pix',
    'delivered'
);
*/

-- Comentários finais
COMMENT ON TABLE orders IS 'Armazena todos os pedidos realizados pelos clientes';
COMMENT ON TABLE favorites IS 'Produtos marcados como favoritos pelos usuários';
COMMENT ON COLUMN orders.order_number IS 'Número único do pedido gerado automaticamente (PZ-2026-0001)';
COMMENT ON COLUMN orders.items IS 'Array JSON com todos os itens do pedido';
COMMENT ON COLUMN orders.status IS 'Status atual: pending, preparing, delivering, delivered, cancelled';
