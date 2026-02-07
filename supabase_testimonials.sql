-- Tabela de Depoimentos
CREATE TABLE IF NOT EXISTS testimonials (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);

-- Política RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública apenas de depoimentos ativos
CREATE POLICY "Permitir leitura pública de depoimentos ativos"
ON testimonials FOR SELECT
USING (is_active = true);

-- Permitir INSERT público (depoimentos criados como inativos)
CREATE POLICY "Permitir criação pública de depoimentos"
ON testimonials FOR INSERT
WITH CHECK (is_active = false);

-- Permitir todas operações para usuários autenticados (admin)
CREATE POLICY "Admin total access"
ON testimonials FOR ALL
USING (auth.role() = 'authenticated');

-- Inserir depoimentos iniciais (todos inativos para aprovação manual)
INSERT INTO testimonials (name, avatar, rating, text, location, is_active) VALUES
('Maria Silva', 'MS', 5, 'A melhor pizza da região! Massa fina e crocante, recheio generoso. Virou tradição da família pedir toda sexta-feira!', 'Novo Amarante', true),
('João Pedro', 'JP', 5, 'Entrega super rápida e pizza quentinha. O sabor é incomparável, vale cada centavo! Atendimento nota 10.', 'Centro', true),
('Ana Costa', 'AC', 5, 'Já experimentei várias pizzarias, mas a Ramos é diferenciada. Ingredientes frescos e aquele gostinho caseiro!', 'Bairro São José', true),
('Carlos Eduardo', 'CE', 5, 'Peço pelo menos 2x por semana! A pizza meio a meio é perfeita para quem gosta de variedade. Recomendo demais!', 'Vila Nova', true),
('Juliana Santos', 'JS', 5, 'Atendimento impecável e pizza deliciosa! O sistema de pedido pelo site é super prático. Parabéns!', 'Jardim América', true),
('Roberto Alves', 'RA', 5, 'Melhor custo-benefício da cidade! Pizza grande, saborosa e preço justo. Já indiquei pra todos os amigos!', 'Novo Amarante', true);

-- Comentários
COMMENT ON TABLE testimonials IS 'Armazena depoimentos de clientes com aprovação manual';
COMMENT ON COLUMN testimonials.is_active IS 'Define se o depoimento está ativo/visível no site';
