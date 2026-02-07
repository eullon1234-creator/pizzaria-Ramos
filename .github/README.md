# 🔄 GitHub Actions - Manter Supabase Ativo

Este diretório contém workflows automáticos do GitHub Actions.

## 📁 Arquivo

### `keep-supabase-alive.yml`
Mantém o projeto Supabase sempre ativo fazendo uma requisição a cada 6 dias.

**O que faz:**
- Executa automaticamente a cada 6 dias
- Faz uma query simples no Supabase
- Evita que o projeto pause por inatividade
- 100% gratuito

**Configuração:**
Veja [SETUP_RAPIDO_SUPABASE.md](../../SETUP_RAPIDO_SUPABASE.md) para configurar os secrets necessários.

**Documentação completa:**
[SUPABASE_KEEP_ALIVE.md](../../SUPABASE_KEEP_ALIVE.md)

---

## ✅ Status

Para ver se está funcionando:
1. Vá em **Actions** no repositório
2. Veja os runs do workflow "Manter Supabase Ativo"
3. ✅ Verde = funcionando
4. ❌ Vermelho = verificar secrets

---

**Não delete este diretório!** É essencial para manter o site online.
