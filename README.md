# 🍕 Pizzaria Ramos - Sistema de Delivery

Sistema completo de delivery para pizzaria com painel administrativo, desenvolvido com React + Vite + Supabase.

## ✨ Funcionalidades

### 👥 Para Clientes

- **Menu Dinâmico**: Navegação por categorias (Pizzas, Porções, Açaí, Molhos, Bebidas)
- **Pizza Meio a Meio**: Sistema exclusivo para montar pizzas com 2 sabores
- **Seletor de Tamanhos**: Escolha de tamanhos e sabores para bebidas
- **Carrinho Inteligente**: Gerenciamento completo de pedidos
- **Checkout Completo**:
  - Formulário de entrega
  - Múltiplas formas de pagamento (PIX, Dinheiro, Cartão)
  - **PIX com QR Code**: Escaneie ou copie a chave PIX
  - Agendamento de entrega
  - Envio automático para WhatsApp

### 👨‍💼 Para Administradores

- **Monitor de Pedidos em Tempo Real**:
  - Notificação sonora para novos pedidos
  - Atualização de status (Pendente → Preparando → Entrega → Entregue)
  - Visualização completa dos dados do cliente
  
- **Gestão do Cardápio**:
  - CRUD completo de produtos
  - Upload de imagens
  - Múltiplos tamanhos e preços
  - Ativar/Desativar produtos
  
- **Sabores de Bebidas**:
  - Gerenciar sabores disponíveis
  - Controle de disponibilidade por tamanho
  
- **Categorias**:
  - Criar e editar categorias
  - Ordenação personalizada
  
- **⭐ Configurações PIX** (NOVO):
  - Upload de QR Code
  - Cadastro de chave PIX
  - Ativar/Desativar PIX como forma de pagamento

## 🚀 Tecnologias

- **Frontend**: React 19.2 + Vite
- **Estilização**: Tailwind CSS 4.1
- **Animações**: Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React

## 📦 Instalação

```bash
# Clone o repositório
git clone [seu-repositorio]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase

# Execute o projeto
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- `categories` - Categorias do menu
- `products` - Produtos do cardápio
- `product_prices` - Preços e tamanhos dos produtos
- `beverage_flavors` - Sabores de bebidas
- `orders` - Pedidos dos clientes
- `order_items` - Itens dos pedidos
- **`pix_settings`** - Configurações PIX (QR Code e chave)

## 🎨 Paleta de Cores

- **Primary**: `#7f1d1d` (Vermelho/Bordeaux)
- **Secondary**: `#fbbf24` (Amarelo/Dourado)
- **Background**: `#fafafa` (Zinc-50)

## 📱 Responsividade

- Design mobile-first
- Menu de navegação adaptativo
- Componentes otimizados para todas as telas

## 🔐 Autenticação

- Sistema de login para administradores
- Proteção de rotas administrativas
- Sessão gerenciada pelo Supabase Auth

## � Manter Supabase Ativo (GRÁTIS)

⚠️ **Importante**: Projetos Supabase gratuitos pausam após 7 dias de inatividade.

✅ **Solução**: GitHub Actions automático mantém seu projeto sempre ativo!

### Setup Rápido (5 minutos):
1. **Adicione secrets no GitHub**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. **Ative GitHub Actions** no repositório
3. **Pronto!** Executa automaticamente a cada 6 dias

📖 **Guias completos**:
- [SETUP_RAPIDO_SUPABASE.md](SETUP_RAPIDO_SUPABASE.md) - Setup em 3 passos
- [SUPABASE_KEEP_ALIVE.md](SUPABASE_KEEP_ALIVE.md) - Documentação completa

**Benefícios:**
- 💰 100% gratuito
- 🤖 Totalmente automatizado
- 🌐 Site sempre online
- 🔄 Sem manutenção

## �📞 Integração WhatsApp

- Envio automático de pedidos
- Formatação profissional da mensagem
- Número configurável

## 🎯 Próximas Funcionalidades

- [ ] Sistema de cupons de desconto
- [ ] Histórico de pedidos do cliente
- [ ] Relatórios e analytics
- [ ] Notificações push
- [ ] App mobile (React Native)

## 📄 Licença

Desenvolvido para Pizzaria Ramos © 2026

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 📞 Suporte

WhatsApp: (86) 99447-1909
Horário: Terça a Domingo, 18:00 às 23:30
