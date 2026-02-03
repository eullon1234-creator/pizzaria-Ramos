# 📦 Configurar Storage do Supabase - Guia Passo a Passo

## 🎯 Objetivo
Configurar o bucket de armazenamento para fazer upload de:
- QR Codes PIX
- Imagens de produtos do cardápio

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **"PIZZARIA-RAMOS"**

---

### 2️⃣ Criar o Bucket de Imagens

1. No menu lateral, clique em **"Storage"** 📦
2. Clique no botão **"New bucket"** (ou "Criar novo bucket")
3. Preencha os campos:

```
Nome do Bucket: images
```

4. **IMPORTANTE**: Marque a opção **"Public bucket"** ✅
   - Isso permite que as imagens sejam acessadas via URL pública
   - Necessário para exibir QR Codes e fotos de produtos

5. Clique em **"Create bucket"** ou **"Salvar"**

---

### 3️⃣ Configurar Políticas de Acesso (RLS)

Agora vamos configurar quem pode fazer upload, visualizar e deletar imagens.

#### 📤 Política 1: Upload de Imagens (Authenticated Users)

1. Clique no bucket **"images"** que você acabou de criar
2. Vá na aba **"Policies"** ou **"Políticas"**
3. Clique em **"New Policy"** → **"Create a policy from scratch"**
4. Preencha:

```
Policy name: Authenticated users can upload images
Allowed operation: INSERT
Target roles: authenticated

Policy definition (SQL):
bucket_id = 'images'
```

5. Clique em **"Save"** ou **"Salvar"**

---

#### 🗑️ Política 2: Deletar Imagens (Authenticated Users)

1. Clique em **"New Policy"** novamente
2. Preencha:

```
Policy name: Authenticated users can delete images
Allowed operation: DELETE
Target roles: authenticated

Policy definition (SQL):
bucket_id = 'images'
```

3. Clique em **"Save"**

---

#### ✏️ Política 3: Atualizar Imagens (Authenticated Users)

1. Clique em **"New Policy"** novamente
2. Preencha:

```
Policy name: Authenticated users can update images
Allowed operation: UPDATE
Target roles: authenticated

Policy definition (SQL):
bucket_id = 'images'
```

3. Clique em **"Save"**

---

#### 👁️ Política 4: Visualizar Imagens (Público)

1. Clique em **"New Policy"** novamente
2. Preencha:

```
Policy name: Public can view images
Allowed operation: SELECT
Target roles: public

Policy definition (SQL):
bucket_id = 'images'
```

3. Clique em **"Save"**

---

## ✅ Verificar Configuração

Após criar todas as políticas, você deve ter:

```
✅ Bucket "images" criado
✅ Bucket configurado como PUBLIC
✅ 4 políticas criadas:
   - Upload (authenticated)
   - Delete (authenticated)
   - Update (authenticated)
   - View (public)
```

---

## 🧪 Testar o Upload

1. Acesse o **Admin Dashboard** do seu app
2. Vá em **"Configurar PIX"**
3. Clique em **"Fazer Upload do QR Code"**
4. Selecione uma imagem
5. Se tudo estiver correto, a imagem será enviada e exibida! 🎉

---

## 🐛 Troubleshooting

### ❌ Erro: "new row violates row-level security policy"
**Solução**: Verifique se você está logado como admin no sistema

### ❌ Erro: "Bucket not found"
**Solução**: Certifique-se de que o bucket se chama exatamente `images` (minúsculo)

### ❌ Imagem não aparece após upload
**Solução**: Verifique se o bucket está marcado como **PUBLIC**

### ❌ Erro de permissão ao fazer upload
**Solução**: Verifique se as políticas de INSERT foram criadas corretamente

---

## 📝 Configuração Alternativa (Via SQL Editor)

Se preferir, você pode executar este SQL no **SQL Editor** do Supabase:

```sql
-- Criar políticas de acesso ao storage
-- ATENÇÃO: Execute isso DEPOIS de criar o bucket manualmente

-- Policy 1: Upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy 2: Delete
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Policy 3: Update
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Policy 4: Public Read
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');
```

---

## 🎯 Estrutura de Pastas Recomendada

Dentro do bucket `images`, organize assim:

```
images/
├── pix/
│   └── qr-code-[timestamp].png
├── products/
│   ├── pizza-margherita.jpg
│   ├── pizza-calabresa.jpg
│   └── ...
└── categories/
    └── ...
```

O código já está configurado para salvar QR Codes em `pix/` automaticamente! ✅

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema, me avise que eu te ajudo! 😊

---

**Última atualização**: 03/02/2026
