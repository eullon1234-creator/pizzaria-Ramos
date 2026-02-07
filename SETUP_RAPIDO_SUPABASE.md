# ⚡ Setup Rápido - 3 Passos

## 📝 Passo 1: Adicionar Secrets no GitHub (2 minutos)

1. Abra seu repositório no GitHub
2. Clique em **Settings** (⚙️ no topo)
3. No menu lateral: **Secrets and variables** → **Actions**
4. Clique no botão verde **New repository secret**

### Secret 1:
```
Nome: SUPABASE_URL
Valor: https://seu-projeto.supabase.co
```
Clique em **Add secret**

### Secret 2:
```
Nome: SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI... (sua chave)
```
Clique em **Add secret**

**💡 Onde encontrar esses valores?**
1. Vá para [app.supabase.com](https://app.supabase.com)
2. Abra seu projeto
3. Vá em **Settings** → **API**
4. Copie **URL** e **anon public** key

---

## ✅ Passo 2: Ativar GitHub Actions (1 minuto)

1. No repositório, clique em **Actions** (🎬 no menu superior)
2. Se aparecer mensagem de permissão, clique em:
   **"I understand my workflows, go ahead and enable them"**
3. Pronto! O workflow está ativado.

---

## 🧪 Passo 3: Testar (2 minutos)

### Teste Manual:
1. Vá em **Actions** → **Manter Supabase Ativo**
2. Clique em **Run workflow** (botão cinza)
3. Selecione **Run workflow** (botão verde)
4. Aguarde ~30 segundos
5. ✅ Se aparecer check verde = **FUNCIONOU!**
6. ❌ Se aparecer X vermelho = veja erro nos logs

### Verificar Logs (se deu erro):
1. Clique no workflow que falhou
2. Clique em **ping-supabase**
3. Veja a mensagem de erro
4. Geralmente é secret com nome errado ou valor incorreto

---

## 🎉 Pronto!

✅ **Seu Supabase agora fica ativo para sempre, de graça!**

O GitHub Actions vai executar automaticamente:
- 🕐 A cada **6 dias** às 8h (UTC)
- 🔄 **Sem você fazer nada**
- 💰 **100% grátis**

### Verificar se está funcionando:

**Opção 1:** Ver histórico GitHub Actions
- Vá em **Actions** no repositório
- Veja os runs do workflow

**Opção 2:** Dashboard Supabase
- Entre no [supabase.com](https://supabase.com)
- Veja "Last active" no seu projeto
- Deve estar sempre recente

---

## ❓ Perguntas Frequentes

**Q: Por que 6 dias?**  
A: Supabase pausa após 7 dias. Deixamos 1 dia de margem.

**Q: Posso mudar a frequência?**  
A: Sim! Edite `.github/workflows/keep-supabase-alive.yml`

**Q: Funciona para sempre?**  
A: Sim! GitHub Actions é grátis ilimitado para repos públicos.

**Q: E se o repositório for privado?**  
A: GitHub dá 2000 minutos grátis/mês. Esse workflow usa ~1 min por execução = ~5 min/mês. Você está coberto!

**Q: Isso afeta meu limite do Supabase?**  
A: Não! É só uma query simples a cada 6 dias. Nem aparece no uso.

---

## 🐛 Problemas Comuns

### Erro: "Request failed"
**Causa:** Secrets incorretos  
**Solução:**
1. Verifique URL e chave no Supabase
2. Copie novamente (sem espaços extras)
3. Atualize secrets no GitHub
4. Rode workflow manualmente de novo

### Erro: "Not found"
**Causa:** Tabela `categories` não existe  
**Solução:**
Edite `.github/workflows/keep-supabase-alive.yml`:
```yaml
# Troque categories por products (ou qualquer tabela que existe)
curl -X GET \
  "${{ secrets.SUPABASE_URL }}/rest/v1/products?select=id&limit=1" \
  ...
```

### Workflow não aparece
**Causa:** Branch não é main/master  
**Solução:** 
- Faça commit na branch principal
- Ou edite o workflow para sua branch

---

## 📚 Documentação Completa

Para entender melhor, veja: [SUPABASE_KEEP_ALIVE.md](SUPABASE_KEEP_ALIVE.md)

---

**🚀 Agora pode relaxar! Seu site fica online 24/7 sem pagar nada!**
