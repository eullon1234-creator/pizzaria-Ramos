# ⚡ Quick Start - Integração PIX

## 🎯 Objetivo
Ativar PIX como método de pagamento na Pizzaria Ramos em 5 minutos.

---

## 📋 Checklist Rápida

- [ ] **1. Banco de Dados** - Tabela criada no Supabase
- [ ] **2. Credenciais** - `.env` configurado com Supabase
- [ ] **3. Admin Login** - Consegue acessar `/admin`
- [ ] **4. Configurar PIX** - Preencheu dados no painel
- [ ] **5. Testar** - Fez pedido de teste com PIX

---

## 🚀 Passo a Passo Rápido

### 1️⃣ **Preparar Banco de Dados** (5 min)

```bash
# Abra Supabase Dashboard
# Vá para SQL Editor
# Cole e execute este código:
```

```sql
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON store_settings
  FOR ALL USING (auth.role() = 'authenticated');
```

✅ Pronto! Banco configurado.

---

### 2️⃣ **Verificar .env** (2 min)

Arquivo: `.env.local` ou `.env`

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

Se não tem, peça ao seu desenvolvedor.

✅ Credenciais prontas.

---

### 3️⃣ **Iniciar Projeto** (3 min)

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

✅ Projeto rodando.

---

### 4️⃣ **Login no Admin** (2 min)

1. Acesse `http://localhost:5173/admin`
2. Faça login com suas credenciais
3. Clique em **"Pedidos"** (abrir este tab)

✅ Admin acessível.

---

### 5️⃣ **Configurar PIX** (3 min)

No painel de Pedidos, clique no botão **"💠 Configurar PIX"**

**Preencha:**

| Campo | Exemplo |
|-------|---------|
| **Tipo de Chave** | CPF |
| **Chave PIX** | 123.456.789-01 |
| **Nome do Titular** | PIZZARIA RAMOS |
| **Nome do Banco** | Nubank |

Clique em **"Salvar Configurações"**

✅ PIX configurado!

---

### 6️⃣ **Testar Fluxo** (5 min)

1. Abra a loja: `http://localhost:5173`
2. Selecione uma pizza
3. Adicione ao carrinho
4. Clique no ícone do carrinho
5. Clique em **"Finalizar Pedido"**
6. Preencha dados
7. Selecione **"PIX"** como pagamento
8. Clique em **"Enviar Pedido"**

Você deve ver:
- ✅ Dados do PIX na tela
- ✅ Botão copiar chave
- ✅ Mensagem WhatsApp aberta

✅ Tudo funcionando!

---

## 📱 O que o Cliente Vê

**Seleção de Pagamento:**
```
💠 PIX  |  💵 Dinheiro  |  💳 Cartão
```

**Após enviar:**
```
✅ Pedido Enviado!

Banco: Nubank
Titular: PIZZARIA RAMOS

Chave PIX: 123.456.789-01 [Copiar]

⚠️ Envie o comprovante no WhatsApp!
```

---

## ⚙️ Valores Padrão para Teste

| Campo | Valor |
|-------|-------|
| Tipo Chave | CPF |
| Chave | 123.456.789-01 |
| Titular | PIZZARIA RAMOS |
| Banco | Nubank |

**⚠️ IMPORTANTE:** Depois de testar, atualize com seus dados reais!

---

## 🆘 Se Algo Não Funcionar

### Erro: "Tabela não existe"
```bash
→ Execute o SQL de criação da tabela (Passo 1)
```

### Erro: "Acesso negado"
```bash
→ Verifique permissões RLS no Supabase
→ Confirme que está logado no admin
```

### Não vê dados salvos
```bash
→ Atualize a página (F5)
→ Abra DevTools (F12) e veja console
```

### PIX não aparece para cliente
```bash
→ Verifique se salvou com sucesso (mensagem verde)
→ Teste de novo a partir do admin
```

---

## 📖 Documentação Completa

Para detalhes técnicos, veja:
- **[PIX_INTEGRATION_GUIDE.md](PIX_INTEGRATION_GUIDE.md)** - Guia completo
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Setup banco de dados

---

## ✅ Sucesso!

Se chegou aqui, PIX está funcionando! 🎉

**Próximas ações:**
1. Testar alguns pedidos com PIX
2. Compartilhar chave PIX real
3. Treinar equipe sobre processo
4. Monitorar primeiros pedidos

---

**Tempo total esperado:** ~20 minutos ⏱️

Qualquer dúvida, consulte os guias ou contate o desenvolvedor.
