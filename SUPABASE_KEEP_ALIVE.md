# 🔄 Manter Supabase Ativo - GRÁTIS

Solução **100% gratuita** para evitar que o projeto Supabase seja pausado por inatividade.

## 🎯 Problema

O Supabase **pausa projetos gratuitos** após **7 dias de inatividade**. Isso significa:
- ❌ Site pode ficar fora do ar
- ❌ Necessário reativar manualmente
- ❌ Má experiência para clientes

## ✅ Solução Grátis

Usamos **GitHub Actions** (grátis e ilimitado para repositórios públicos) para fazer requisições automáticas a cada **6 dias**.

### Como Funciona

```
┌─────────────────┐
│  GitHub Actions │  ← Executa automaticamente
└────────┬────────┘
         │ A cada 6 dias
         ↓
┌─────────────────┐
│   Supabase API  │  ← Faz requisição simples
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Projeto Ativo!  │  ← Nunca pausa
└─────────────────┘
```

---

## 🚀 Setup (5 minutos)

### Passo 1: Adicionar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral: **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Adicione 2 secrets:

**Secret 1:**
```
Nome: SUPABASE_URL
Valor: https://seu-projeto.supabase.co
```

**Secret 2:**
```
Nome: SUPABASE_ANON_KEY
Valor: sua_chave_anon_key_aqui
```

### Passo 2: Ativar GitHub Actions

1. No repositório, vá em **Actions** (menu superior)
2. Se pedir permissão, clique em **I understand my workflows, go ahead and enable them**
3. Procure o workflow **"Manter Supabase Ativo"**
4. Ele executará automaticamente!

### Passo 3: Testar Manualmente (Opcional)

1. Vá em **Actions** → **Manter Supabase Ativo**
2. Clique em **Run workflow** → **Run workflow**
3. Aguarde ~30 segundos
4. ✅ Se aparecer check verde = funcionou!

---

## 📅 Agendamento

O workflow executa:
- ⏰ **A cada 6 dias** às 8h (horário UTC)
- 🔄 **Automaticamente** (sem fazer nada)
- ✅ **Grátis para sempre**

### Por que 6 dias?

- Supabase pausa após **7 dias** de inatividade
- Deixamos 1 dia de margem de segurança
- GitHub Actions é confiável, mas bom ter folga

---

## 🔍 Verificar se está Funcionando

### Opção 1: Ver Histórico GitHub
1. Vá em **Actions** no repositório
2. Veja os runs do workflow
3. ✅ Verde = funcionando
4. ❌ Vermelho = verificar secrets

### Opção 2: Dashboard Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Veja **Last active**: deve estar sempre recente

---

## 🛠️ Customização

### Mudar Frequência

Edite `.github/workflows/keep-supabase-alive.yml`:

```yaml
# A cada 3 dias
- cron: '0 8 */3 * *'

# Diário
- cron: '0 8 * * *'

# Semanal (domingo)
- cron: '0 8 * * 0'
```

**⚠️ Não recomendado:** Muito frequente = desperdício de recursos.

### Testar Outra Tabela

Se `categories` não existir, mude para `products`:

```yaml
curl -X GET \
  "${{ secrets.SUPABASE_URL }}/rest/v1/products?select=id&limit=1" \
  ...
```

---

## 🐛 Troubleshooting

### ❌ Workflow não executa

**Causa:** Repositório inativo por 60+ dias  
**Solução:** Fazer qualquer commit no repo

### ❌ Erro "Request failed"

**Causa:** Secrets incorretos  
**Solução:**
1. Verificar URL e chave no Supabase
2. Atualizar secrets no GitHub
3. Rodar workflow manualmente

### ❌ Workflow rodou mas Supabase pausou

**Causa:** RLS (Row Level Security) bloqueando  
**Solução:** Permitir leitura pública na tabela:

```sql
-- No Supabase SQL Editor
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública"
ON categories FOR SELECT
USING (true);
```

---

## 💡 Alternativas Grátis

Se GitHub Actions não funcionar, use:

### 1. Cron-job.org
```
Site: https://cron-job.org
URL: https://seu-projeto.supabase.co/rest/v1/categories?select=id
Frequência: A cada 6 dias
Headers: 
  - apikey: sua_chave
  - Authorization: Bearer sua_chave
```

### 2. UptimeRobot
```
Site: https://uptimerobot.com
Tipo: HTTP(s) monitor
URL: [mesma URL acima]
Check: A cada 6 dias (ou menor)
```

### 3. Google Cloud Scheduler
```
Grátis: 3 jobs
Frequência: 0 8 */6 * *
Target: HTTP
URL: [mesma URL acima]
```

---

## 📊 Custos

| Solução | Custo | Limite |
|---------|-------|--------|
| **GitHub Actions** | **R$ 0** | Ilimitado (repo público) |
| Cron-job.org | R$ 0 | 5 jobs grátis |
| UptimeRobot | R$ 0 | 50 monitores |
| Google Cloud | R$ 0 | 3 jobs grátis |

**🎉 Todas as soluções são 100% gratuitas!**

---

## ✅ Checklist Final

- [ ] Arquivo `.github/workflows/keep-supabase-alive.yml` criado
- [ ] Secrets adicionados no GitHub
- [ ] GitHub Actions ativado
- [ ] Workflow executado manualmente (teste)
- [ ] ✅ Check verde no workflow
- [ ] Dashboard Supabase mostra "Last active" recente

---

## 🎯 Resultado

✅ **Supabase nunca mais será pausado**  
✅ **Solução 100% gratuita**  
✅ **Totalmente automatizada**  
✅ **Sem manutenção necessária**

---

## 📞 Suporte

### Workflow falhou?
1. Verificar secrets no GitHub
2. Testar URL manualmente no navegador
3. Verificar políticas RLS no Supabase

### Precisa de ajuda?
- Veja logs em **Actions** → **Workflow run** → **ping-supabase**
- Erro comum: secrets com nome errado ou valores incorretos

---

**🚀 Pronto! Seu Supabase agora fica ativo para sempre, de graça!**
