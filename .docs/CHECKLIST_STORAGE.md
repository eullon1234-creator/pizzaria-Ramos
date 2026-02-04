# ✅ Checklist: Configurar Storage Supabase

## 🎯 Objetivo
Permitir upload de QR Codes PIX e imagens de produtos

---

## 📝 Checklist Rápido

### Passo 1: Criar Bucket
- [ ] Acessar https://supabase.com/dashboard
- [ ] Selecionar projeto **PIZZARIA-RAMOS**
- [ ] Ir em **Storage** (menu lateral)
- [ ] Clicar em **"New bucket"**
- [ ] Nome: `images`
- [ ] ✅ Marcar **"Public bucket"**
- [ ] Clicar em **"Create bucket"**

### Passo 2: Configurar Políticas (Opção A - Interface)
- [ ] Clicar no bucket **"images"**
- [ ] Ir na aba **"Policies"**
- [ ] Criar 4 políticas (ver detalhes no guia completo)

### Passo 2: Configurar Políticas (Opção B - SQL) ⭐ RECOMENDADO
- [ ] Ir em **SQL Editor** (menu lateral)
- [ ] Clicar em **"New query"**
- [ ] Copiar o conteúdo do arquivo `.docs/storage-policies.sql`
- [ ] Colar no editor
- [ ] Clicar em **"Run"** ou **F5**
- [ ] Verificar se apareceram 4 políticas na query de verificação

### Passo 3: Testar
- [ ] Abrir o app
- [ ] Fazer login como admin
- [ ] Ir em **"Configurar PIX"**
- [ ] Fazer upload de uma imagem de teste
- [ ] Verificar se a imagem aparece

---

## 🚀 Atalho Rápido

**Opção mais rápida (2 minutos):**

1. Dashboard Supabase → Storage → New Bucket
   - Nome: `images`
   - Public: ✅ YES
   
2. SQL Editor → New Query → Colar e executar:
   ```sql
   -- (conteúdo do arquivo storage-policies.sql)
   ```

3. Pronto! ✅

---

## 📁 Arquivos de Referência

- 📖 **Guia Completo**: `.docs/CONFIGURAR_STORAGE_SUPABASE.md`
- 💾 **Script SQL**: `.docs/storage-policies.sql`

---

## ❓ Dúvidas?

Se algo não funcionar, verifique:
1. Bucket se chama exatamente `images` (minúsculo)
2. Bucket está marcado como **PUBLIC**
3. Você está logado como admin no app
4. As 4 políticas foram criadas

---

**Status**: ⏳ Aguardando configuração
**Tempo estimado**: 2-5 minutos
