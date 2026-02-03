# 💠 Guia Completo de Integração PIX - Pizzaria Ramos

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
4. [Como Usar no Painel Admin](#como-usar-no-painel-admin)
5. [Experiência do Cliente](#experiência-do-cliente)
6. [Validações e Segurança](#validações-e-segurança)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A integração PIX permite que clientes realizem pagamentos via PIX ao finalizar pedidos. O sistema:

- ✅ Armazena dados de configuração PIX no Supabase
- ✅ Valida diferentes tipos de chave PIX (CPF, CNPJ, Email, Telefone)
- ✅ Exibe informações PIX na tela de sucesso do pedido
- ✅ Permite copiar chave PIX com um clique
- ✅ Oferece interface admin intuitiva para gerenciar dados

---

## 🔧 Configuração Inicial

### Pré-requisitos
- Conta Supabase com tabela `store_settings` criada
- Chave PIX válida (CPF, CNPJ, Email ou Telefone)
- Acesso ao Painel Admin da Pizzaria

### Estrutura de Dados (Supabase)

A configuração PIX é armazenada em `store_settings` com o seguinte formato:

```json
{
  "key": "pix_config",
  "value": {
    "pix_key": "123.456.789-01",
    "key_type": "cpf",
    "holder_name": "PIZZARIA RAMOS",
    "bank_name": "Nubank"
  }
}
```

**Tipos de Chave Aceitos:**
- `cpf`: CPF com 11 dígitos (com ou sem formatação)
- `cnpj`: CNPJ com 14 dígitos (com ou sem formatação)
- `email`: Email válido
- `phone`: Telefone com 10 ou 11 dígitos (com ou sem formatação)

---

## 🔄 Fluxo de Funcionamento

```
Cliente faz pedido
        ↓
Acessa Checkout
        ↓
Seleciona "PIX" como método de pagamento
        ↓
Preenche dados de entrega
        ↓
Clica "Enviar Pedido"
        ↓
Pedido é salvo no Supabase
        ↓
Mensagem WhatsApp é gerada
        ↓
Tela de sucesso exibe:
    - Informações do Banco
    - Nome do Titular
    - Chave PIX (copiável)
    - Aviso para enviar comprovante
```

---

## 📱 Como Usar no Painel Admin

### Acessar Configurações PIX

1. **Login no Admin:**
   - Acesse `/admin`
   - Insira suas credenciais

2. **Ir para Pedidos:**
   - Clique em "Pedidos" no menu lateral

3. **Configurar PIX:**
   - Clique no botão "💠 Configurar PIX" no topo da página

### Preencher as Informações

**Modal de Configuração PIX:**

```
┌─────────────────────────────────────┐
│     ❌ Configurar PIX           X   │
├─────────────────────────────────────┤
│  Tipo de Chave PIX:                 │
│  [CPF] [CNPJ] [EMAIL] [CEL]        │
│                                      │
│  CPF:                               │
│  ┌──────────────────────────────┐  │
│  │ 123.456.789-01              │  │
│  └──────────────────────────────┘  │
│                                      │
│  Nome do Titular:                   │
│  ┌──────────────────────────────┐  │
│  │ PIZZARIA RAMOS              │  │
│  └──────────────────────────────┘  │
│                                      │
│  Nome do Banco:                     │
│  ┌──────────────────────────────┐  │
│  │ Nubank                       │  │
│  └──────────────────────────────┘  │
│                                      │
│  [💾 Salvar Configurações]          │
└─────────────────────────────────────┘
```

### Validações em Tempo Real

O sistema valida:

- **CPF:** Formato 11 dígitos ou `XXX.XXX.XXX-XX`
- **CNPJ:** Formato 14 dígitos ou `XX.XXX.XXX/XXXX-XX`
- **Email:** Deve conter `@` e domínio válido
- **Telefone:** 10-11 dígitos ou `(XX) XXXXX-XXXX`
- **Campos obrigatórios:** Todos são necessários

Se houver erro, uma mensagem clara aparece indicando o problema.

---

## 👥 Experiência do Cliente

### 1️⃣ Seleção de Pagamento

```
┌──────────────────────────┐
│ Forma de Pagamento:      │
│                          │
│ 💠 PIX  💵 Dinheiro 💳 Cartão│
│                          │
└──────────────────────────┘
```

### 2️⃣ Tela de Sucesso (com PIX)

```
┌────────────────────────────────────┐
│  ✅ Pedido Enviado!                │
│                                     │
│  Seu pedido foi registrado...       │
│                                     │
│  ┌──────────────────────────────┐ │
│  │ 💠 Pagamento via PIX        │ │
│  ├──────────────────────────────┤ │
│  │ Banco: Nubank               │ │
│  │ Titular: PIZZARIA RAMOS    │ │
│  │                              │ │
│  │ Chave PIX (CPF):            │ │
│  │ ┌──────────────────────────┐ │ │
│  │ │ 123.456.789-01  [Copiar] │ │ │
│  │ └──────────────────────────┘ │ │
│  │                              │ │
│  │ ⚠️ Importante: Envie o       │ │
│  │ comprovante no WhatsApp!    │ │
│  └──────────────────────────────┘ │
│                                     │
│  [Fechar e Voltar ao Cardápio]    │
└────────────────────────────────────┘
```

### 3️⃣ Ação de Cópia

- Cliente clica no botão "Copiar"
- Chave PIX é copiada para clipboard
- Checkmark verde aparece por 2 segundos
- Cliente pode colar em app de banco

---

## 🔐 Validações e Segurança

### Validações Implementadas

#### 1. **Validação de Chave PIX**
```javascript
// CPF: 11 dígitos
/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// CNPJ: 14 dígitos
/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

// Email
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Telefone: 10-11 dígitos
/^\d{10,11}$|^\(\d{2}\)\s?\d{4,5}-\d{4}$/
```

#### 2. **Validação de Campos Obrigatórios**
- Chave PIX não pode estar vazia
- Nome do titular é obrigatório
- Nome do banco é obrigatório

#### 3. **Mensagens de Erro**
- Cada erro tem mensagem específica
- Em português para facilitar
- Validações ocorrem ao salvar

### Segurança nos Dados

- ✅ Dados armazenados no Supabase (banco seguro)
- ✅ Não há exposição de dados sensíveis na URL
- ✅ Chave PIX só aparece para admin e cliente pós-pedido
- ✅ Validação no lado do cliente + servidor
- ✅ Permissões do Supabase controlam acesso

---

## 📂 Estrutura de Arquivos Relacionados

```
src/
├── components/
│   ├── PixSettingsModal.jsx          ← Configurações PIX (ADMIN)
│   └── Checkout.jsx                  ← Exibe PIX ao cliente
├── context/
│   └── CartContext.jsx               ← Gerencia carrinho
├── pages/
│   ├── AdminDashboard.jsx            ← Abre modal PIX
│   └── Store.jsx                     ← Página principal
├── lib/
│   └── supabase.js                   ← Cliente Supabase
└── PIX_INTEGRATION_GUIDE.md          ← Este arquivo
```

---

## 🛠️ Troubleshooting

### ❌ "Erro ao salvar as configurações"

**Causa:** Problema com conexão Supabase ou tabela `store_settings`

**Solução:**
1. Verifique se tabela `store_settings` existe no Supabase
2. Verifique credenciais do Supabase em `.env`
3. Teste conexão com outras funcionalidades
4. Verifique logs do navegador (F12 → Console)

---

### ❌ "CPF inválido"

**Causa:** Formato incorreto

**Soluções:**
- Formato correto: `123.456.789-01` (com formatação)
- Ou: `12345678901` (sem formatação, 11 dígitos)
- Sem espaços extras no início/fim

---

### ❌ "Email inválido"

**Causa:** Email não é válido

**Solução:**
- Use formato padrão: `usuario@dominio.com`
- Deve conter `@` e domínio válido

---

### ✅ Configurações não aparecem para cliente

**Possível causa:** Modal não foi completado

**Verificar:**
1. Abra Painel Admin
2. Vá para "Pedidos"
3. Clique "💠 Configurar PIX"
4. Preencha todos os campos
5. Clique "Salvar Configurações"
6. Aguarde sucesso

---

### 💻 Testando Localmente

Para testar o fluxo PIX:

```javascript
// No console do navegador, teste fetch à API:
const testKey = 'seu.cpf@aqui.com';
// Deve passar validation se formato está correto
```

---

## 📊 Dados Armazenados no Supabase

### Tabela: `store_settings`

| Campo | Tipo | Conteúdo |
|-------|------|----------|
| `id` | UUID | ID único |
| `key` | VARCHAR | `pix_config` |
| `value` | JSONB | Objeto com config PIX |
| `created_at` | TIMESTAMP | Data criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Exemplo de valor:**
```json
{
  "pix_key": "123.456.789-01",
  "key_type": "cpf",
  "holder_name": "PIZZARIA RAMOS",
  "bank_name": "Nubank"
}
```

---

## 🎯 Próximos Passos

1. ✅ Configurar PIX no painel admin (Este guia)
2. ⏳ Implementar geração de QR Code (futuro)
3. ⏳ Adicionar histórico de pagamentos
4. ⏳ Integrar API de confirmação automática de PIX

---

## 📞 Suporte

Para dúvidas sobre a integração:
1. Consulte este guia
2. Verifique console do navegador (F12)
3. Verifique logs do Supabase
4. Entre em contato com o desenvolvedor

---

**Última atualização:** 2 de fevereiro de 2026
**Status:** ✅ Completo e testado
