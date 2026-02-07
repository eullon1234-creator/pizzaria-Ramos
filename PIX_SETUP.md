# 🍕 Pizzaria Ramos - Sistema Online

Aplicação web completa para a Pizzaria Ramos, construída com **React + Vite**, com integração PIX, painel administrativo e carrinho de compras.

## ✨ Funcionalidades Principais

### 👥 Cliente (Loja)
- ✅ Catálogo de pizzas, bebidas e outros itens
- ✅ Carrinho de compras funcional
- ✅ Customização de pizzas (meia-meia, tamanhos)
- ✅ Checkout completo
- ✅ Métodos de pagamento: **PIX** 💠, Dinheiro, Cartão
- ✅ Integração WhatsApp para pedidos
- ✅ Armazenamento de dados do cliente (localStorage)
- ✅ Responsivo (mobile/desktop)

### 👨‍💼 Admin (Painel de Controle)
- ✅ Monitor em tempo real de pedidos
- ✅ Gerenciamento de cardápio (produtos, categorias)
- ✅ Sabores de bebidas com tamanhos disponíveis
- ✅ **Configuração de PIX** 💠 (novo!)
- ✅ Configuração de horários de funcionamento
- ✅ Atualização de status de pedidos
- ✅ Notificação de novos pedidos (som)

---

## 💠 PIX - Novo Recurso!

Integração completa com PIX para pagamentos.

### Documentação de PIX
- **[INDEX.md](INDEX.md)** - Índice completo de documentação
- **[QUICK_START_PIX.md](QUICK_START_PIX.md)** - Colocar PIX em 20 min
- **[PIX_INTEGRATION_GUIDE.md](PIX_INTEGRATION_GUIDE.md)** - Guia completo
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Setup do banco
- **[PIX_DIAGRAMS.md](PIX_DIAGRAMS.md)** - Diagramas da arquitetura
- **[PIX_TESTING_GUIDE.md](PIX_TESTING_GUIDE.md)** - Como testar
- **[SUMMARY.md](SUMMARY.md)** - Resumo executivo

### Features PIX
- ✅ 4 tipos de chave (CPF, CNPJ, Email, Telefone)
- ✅ Validações robustas
- ✅ Interface admin intuitiva
- ✅ Tela de sucesso com dados PIX
- ✅ Botão copiar chave
- ✅ Integração Supabase

### Início Rápido PIX
```bash
# 1. Criar tabela no Supabase (veja DATABASE_SETUP.md)
# 2. npm install
# 3. npm run dev
# 4. Acessar admin e clicar "Configurar PIX"
```

---

## 🔧 Stack Técnico

```
Frontend:
├─ React 19
├─ React Router 7
├─ Vite 7
├─ Tailwind CSS 4
├─ Framer Motion (animações)
└─ Lucide React (ícones)

Backend:
├─ Supabase (PostgreSQL)
├─ Supabase Auth
└─ Supabase Realtime
```

---

## 🚀 Começar Rápido

### Instalação Básica
```bash
# Clonar
git clone <repo>
cd pizzaria-Ramos-1

# Instalar
npm install

# Configurar .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Rodar
npm run dev
```

Acesse: `http://localhost:5173`

### Com PIX (Recomendado)
Siga [QUICK_START_PIX.md](QUICK_START_PIX.md) para setup completo.

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── PixSettingsModal.jsx      ← PIX (NOVO!)
│   ├── Checkout.jsx
│   ├── CartDrawer.jsx
│   ├── Menu.jsx
│   └── ... outros
├── pages/
│   ├── Store.jsx
│   ├── AdminDashboard.jsx
│   └── AdminLogin.jsx
├── context/
│   └── CartContext.jsx
└── lib/
    └── supabase.js

Documentação/
├── INDEX.md                    ← Comece aqui!
├── QUICK_START_PIX.md          ← PIX em 20 min
├── PIX_INTEGRATION_GUIDE.md    ← Guia completo
├── DATABASE_SETUP.md           ← SQL banco
├── PIX_DIAGRAMS.md             ← Diagramas
├── PIX_TESTING_GUIDE.md        ← Testes
└── SUMMARY.md                  ← Resumo
```

---

## 🎯 Primeiros Passos

### 1. Ler Documentação
```
👉 Comece com: INDEX.md
   └─ Tem índice de todos os docs
```

### 2. Para PIX
```
👉 Siga: QUICK_START_PIX.md
   └─ Setup em 20 minutos
```

### 3. Para Entender Tudo
```
👉 Leia: PIX_INTEGRATION_GUIDE.md
   └─ Visão completa do sistema
```

---

## 📊 Documentação Disponível

| Documento | Tempo | Uso |
|-----------|-------|-----|
| INDEX.md | 10 min | Índice completo |
| QUICK_START_PIX.md | 20 min | Setup rápido |
| PIX_INTEGRATION_GUIDE.md | 30 min | Entender tudo |
| DATABASE_SETUP.md | 10 min | Config banco |
| PIX_DIAGRAMS.md | 20 min | Ver diagramas |
| PIX_TESTING_GUIDE.md | 40 min | Testar |
| SUMMARY.md | 5 min | Resumo |
| **SUPABASE_KEEP_ALIVE.md** | **5 min** | **Manter DB ativo** 🔄 |

👉 **Leia [INDEX.md](INDEX.md) primeiro!**

---

## 🛠️ Scripts

```bash
npm run dev      # Dev server
npm run build    # Build produção  
npm run lint     # ESLint
npm run preview  # Preview build
```

---

## 🔒 Segurança

- ✅ Autenticação Supabase
- ✅ Políticas RLS
- ✅ Validações
- ✅ Env vars protegidas

---

## 🔄 Manter Supabase Ativo - GRÁTIS

**Problema:** Supabase pausa projetos gratuitos após 7 dias de inatividade.  
**Solução:** GitHub Actions automático mantém seu projeto sempre ativo!

### Setup Rápido (5 min)
1. Adicione 2 secrets no GitHub (Settings → Secrets):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Ative GitHub Actions no repositório
3. Pronto! Executa automaticamente a cada 6 dias

👉 **Guia completo:** [SUPABASE_KEEP_ALIVE.md](SUPABASE_KEEP_ALIVE.md)

---

## 📱 Responsividade

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile
- ✅ Touch-friendly

---

## 🚀 Deploy

```bash
npm run build
# Push para GitHub
# Deploy no Vercel
```

Veja [vercel.json](vercel.json).

---

## 📞 Suporte

### Documentação Completa
Veja [INDEX.md](INDEX.md) para todos os guias.

### Para Dúvidas
1. Procure em [INDEX.md](INDEX.md)
2. Leia doc relevante
3. Procure "Troubleshooting"
4. Verifique console (F12)

---

## 📈 Próximas Versões

- [ ] QR Code PIX
- [ ] Webhook confirmação
- [ ] App mobile
- [ ] Loyalty program

---

## 📄 Info

- **Versão:** 1.0.0
- **Status:** ✅ Produção
- **Desenvolvido:** 2 fev 2026
- **Para:** Pizzaria Ramos

---

**👉 Comece em [INDEX.md](INDEX.md) ou [QUICK_START_PIX.md](QUICK_START_PIX.md)**
