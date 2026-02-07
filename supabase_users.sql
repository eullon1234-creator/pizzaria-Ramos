-- ==========================================
-- SISTEMA DE LOGIN SIMPLES PARA CLIENTES
-- Copie TODO este arquivo e execute no Supabase
-- ==========================================

-- 1️⃣ Criar tabela de usuários (clientes)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2️⃣ Criar índice para busca rápida por telefone
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 3️⃣ Ativar segurança RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Políticas de segurança
-- Permitir que qualquer um crie um usuário (cadastro público)
CREATE POLICY "Permitir cadastro público"
ON users FOR INSERT
WITH CHECK (true);

-- Permitir que qualquer um leia usuários (para buscar por telefone no login)
CREATE POLICY "Permitir leitura pública"
ON users FOR SELECT
USING (true);

-- Permitir atualização do last_login
CREATE POLICY "Permitir atualização de last_login"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5️⃣ Comentários
COMMENT ON TABLE users IS 'Usuários/clientes do sistema (login simples com nome + WhatsApp)';
COMMENT ON COLUMN users.phone IS 'Número de WhatsApp no formato: 5585999887766';
COMMENT ON COLUMN users.last_login IS 'Data/hora do último login';

-- ==========================================
-- ✅ PRONTO!
-- Tabela users criada com login simples
-- Campos: nome + WhatsApp (sem senha!)
-- ==========================================
