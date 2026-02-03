# 🗄️ Setup do Banco de Dados - Pizzaria Ramos

## Tabela `store_settings`

Se você ainda não criou a tabela `store_settings`, execute este SQL no Supabase:

```sql
-- Criar tabela store_settings se não existir
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);

-- Política RLS (Row Level Security) - IMPORTANTE!
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa autenticada leia
CREATE POLICY "Allow read for authenticated users"
  ON store_settings
  FOR SELECT
  USING (true);

-- Permitir que apenas admin (usuário autenticado) escreva
CREATE POLICY "Allow write for authenticated admin"
  ON store_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

## Inserir Configuração PIX Inicial

Se preferir já ter dados de teste:

```sql
-- Inserir configuração PIX padrão (TESTE)
INSERT INTO store_settings (key, value) 
VALUES (
  'pix_config',
  '{"pix_key": "123.456.789-01", "key_type": "cpf", "holder_name": "PIZZARIA RAMOS", "bank_name": "Nubank"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Inserir horários de funcionamento padrão
INSERT INTO store_settings (key, value)
VALUES (
  'business_hours',
  '{
    "0": {"open": true, "openTime": "18:00", "closeTime": "23:30"},
    "1": {"open": false, "openTime": "00:00", "closeTime": "00:00"},
    "2": {"open": true, "openTime": "18:00", "closeTime": "23:30"},
    "3": {"open": true, "openTime": "18:00", "closeTime": "23:30"},
    "4": {"open": true, "openTime": "18:00", "closeTime": "23:30"},
    "5": {"open": true, "openTime": "18:00", "closeTime": "23:30"},
    "6": {"open": true, "openTime": "18:00", "closeTime": "23:30"}
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
```

## Testar a Configuração

No console do navegador, após fazer login no admin:

```javascript
import { supabase } from './lib/supabase'

// Teste 1: Buscar configuração PIX
async function testPixConfig() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('key', 'pix_config')
    .single()
  
  console.log('PIX Config:', data)
  if (error) console.error('Erro:', error)
}

testPixConfig()
```

## Estrutura Completa do Banco

```
store_settings
├── id (UUID) - PK
├── key (VARCHAR, UNIQUE)
├── value (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

orders
├── id (VARCHAR) - PK
├── sequential_num (INTEGER)
├── user_name (VARCHAR)
├── user_phone (VARCHAR)
├── delivery_address (JSONB)
├── delivery_type (VARCHAR)
├── scheduled_time (VARCHAR)
├── subtotal (DECIMAL)
├── delivery_fee (DECIMAL)
├── total (DECIMAL)
├── status (VARCHAR)
├── payment_method (VARCHAR)
├── change_for (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

order_items
├── id (UUID) - PK
├── order_id (VARCHAR) - FK
├── flavor_1_id (VARCHAR)
├── item_type (VARCHAR)
├── quantity (INTEGER)
├── price (DECIMAL)
├── size_label (VARCHAR)
├── observations (TEXT)
└── product_description (TEXT)
```

## Permissões Recomendadas

No Supabase Dashboard:
1. Vá para **Authentication** → **Policies**
2. Configure para que:
   - Usuários anônimos podem ler produtos/categorias
   - Usuários autenticados podem criar pedidos
   - Admin pode ler/escrever tudo

## Problemas Comuns

### "Permission denied" ao salvar PIX
- Verifique políticas RLS
- Certifique-se de estar logado no admin
- Verifique se a tabela existe

### "pix_config not found"
- Está normal se for primeira vez
- O sistema cria automaticamente ao salvar
- Ou insira manualmente com SQL acima

### Erro ao conectar
- Verifique VITE_SUPABASE_URL em .env
- Verifique VITE_SUPABASE_ANON_KEY em .env
- Teste conexão com outras queries
