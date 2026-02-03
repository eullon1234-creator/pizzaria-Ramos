# 🧪 Guia de Testes - Integração PIX

## 📝 Casos de Teste

### ✅ Testes de Validação

#### 1. Validação CPF

```
CASO 1.1: CPF válido sem formatação
├─ Entrada: "12345678901"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 1.2: CPF válido com formatação
├─ Entrada: "123.456.789-01"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 1.3: CPF inválido - muito curto
├─ Entrada: "123456789"
├─ Mensagem: "CPF inválido. Use formato 12345678901 ou 123.456.789-01"
└─ Resultado: PASS

CASO 1.4: CPF inválido - com letras
├─ Entrada: "1234567890a"
├─ Mensagem: "CPF inválido..."
└─ Resultado: PASS

CASO 1.5: CPF com espaços
├─ Entrada: "123 456 789 01"
├─ Esperado: ❌ Rejeito
└─ Resultado: PASS
```

#### 2. Validação CNPJ

```
CASO 2.1: CNPJ válido sem formatação
├─ Entrada: "12345678000195"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 2.2: CNPJ válido com formatação
├─ Entrada: "12.345.678/0001-95"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 2.3: CNPJ inválido - muito curto
├─ Entrada: "123456780001"
├─ Mensagem: "CNPJ inválido..."
└─ Resultado: PASS
```

#### 3. Validação Email

```
CASO 3.1: Email válido simples
├─ Entrada: "pizza@ramos.com"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 3.2: Email válido complexo
├─ Entrada: "contato.pizzaria@ramos.com.br"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 3.3: Email sem @
├─ Entrada: "pizzaramos.com"
├─ Mensagem: "Email inválido"
└─ Resultado: PASS

CASO 3.4: Email sem domínio
├─ Entrada: "pizza@"
├─ Mensagem: "Email inválido"
└─ Resultado: PASS
```

#### 4. Validação Telefone

```
CASO 4.1: Telefone 11 dígitos
├─ Entrada: "11999999999"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 4.2: Telefone 10 dígitos
├─ Entrada: "1133334444"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 4.3: Telefone com formatação
├─ Entrada: "(11) 99999-9999"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 4.4: Telefone com formatação (sem 9)
├─ Entrada: "(11) 3333-4444"
├─ Esperado: ✅ Aceito
└─ Resultado: PASS

CASO 4.5: Telefone inválido - muito curto
├─ Entrada: "119999999"
├─ Mensagem: "Telefone inválido..."
└─ Resultado: PASS
```

### ✅ Testes de Campos Obrigatórios

```
CASO 5.1: Chave PIX vazia
├─ Ação: Deixa campo em branco e clica salvar
├─ Mensagem: "Chave PIX é obrigatória"
├─ Modal: Permanece aberto
└─ Resultado: PASS

CASO 5.2: Nome Titular vazio
├─ Ação: Preenche chave, deixa titular vazio
├─ Mensagem: "Nome do titular é obrigatório"
└─ Resultado: PASS

CASO 5.3: Nome Banco vazio
├─ Ação: Preenche outros, deixa banco vazio
├─ Mensagem: "Nome do banco é obrigatório"
└─ Resultado: PASS

CASO 5.4: Todos os campos vazios
├─ Ação: Clica salvar sem preencher nada
├─ Mensagem: "Chave PIX é obrigatória" (validação por ordem)
└─ Resultado: PASS
```

### ✅ Testes de Interface

```
CASO 6.1: Mudar tipo de chave
├─ Ação: Clica em diferentes tipos (CPF, CNPJ, Email, Cel)
├─ Esperado:
│  ├─ Placeholder muda
│  ├─ Texto de ajuda muda
│  └─ Campo CPF é limpo ao trocar
└─ Resultado: PASS

CASO 6.2: Exibir tela de sucesso
├─ Ação: Preenche e salva com sucesso
├─ Esperado:
│  ├─ Ícone ✅ aparece
│  ├─ Mensagem "Sucesso!"
│  ├─ Modal fecha após 1.5s
│  └─ Dados são salvos
└─ Resultado: PASS

CASO 6.3: Exibir erro com fundo vermelho
├─ Ação: Preenche CPF inválido e tenta salvar
├─ Esperado:
│  ├─ Aviso vermelho aparece
│  ├─ Ícone de alerta
│  ├─ Mensagem clara em português
│  └─ Campo ainda visível para corrigir
└─ Resultado: PASS

CASO 6.4: Loading spinner durante save
├─ Ação: Preenche e clica salvar
├─ Esperado:
│  ├─ Botão fica desabilitado
│  ├─ Spinner aparecer
│  ├─ Texto muda para "Salvando..."
│  └─ Pode-se clicar no X para cancelar
└─ Resultado: PASS

CASO 6.5: Fechar modal com X
├─ Ação: Clica no X (canto superior direito)
├─ Esperado:
│  ├─ Modal fecha com animação
│  ├─ Dados não são salvos
│  └─ Estado anterior mantido
└─ Resultado: PASS

CASO 6.6: Fechar ao clicar fora (backdrop)
├─ Ação: Clica na área escura fora do modal
├─ Esperado:
│  ├─ Modal fecha
│  ├─ Dados não salvo
│  └─ Animação suave
└─ Resultado: PASS
```

### ✅ Testes de Integração com Supabase

```
CASO 7.1: Salvar configuração nova
├─ Pré-condição: store_settings vazio
├─ Ação: Preenche dados e salva
├─ Esperado:
│  ├─ INSERT executado
│  ├─ Mensagem "Sucesso!" aparece
│  └─ Dados aparecem no Supabase
├─ Verificação: SELECT no Supabase confirma
└─ Resultado: PASS

CASO 7.2: Atualizar configuração existente
├─ Pré-condição: store_settings já tem dados
├─ Ação: Muda valores e salva
├─ Esperado:
│  ├─ UPDATE executado (não INSERT)
│  ├─ Mensagem "Sucesso!"
│  └─ Dados antigos substituídos
├─ Verificação: SELECT mostra novos dados
└─ Resultado: PASS

CASO 7.3: Carregar dados ao abrir modal
├─ Pré-condição: Dados existem no Supabase
├─ Ação: Abre modal
├─ Esperado:
│  ├─ Campos são preenchidos
│  ├─ Carrega dados corretos
│  └─ keyType corresponde ao tipo salvo
├─ Verificação: Valores batem com Supabase
└─ Resultado: PASS

CASO 7.4: Modal vazio se sem dados
├─ Pré-condição: Nenhuma config no Supabase
├─ Ação: Abre modal
├─ Esperado:
│  ├─ Campos vazios
│  ├─ keyType = "cpf" (padrão)
│  └─ Aviso de dica visível
├─ Verificação: Nenhum erro no console
└─ Resultado: PASS

CASO 7.5: Erro de conexão com Supabase
├─ Pré-condição: Internet desligada/Supabase down
├─ Ação: Tenta salvar
├─ Esperado:
│  ├─ Mensagem: "Erro ao salvar as configurações..."
│  ├─ Modal permanece aberto
│  └─ Usuário pode tentar novamente
├─ Verificação: Erro no console do navegador
└─ Resultado: PASS
```

### ✅ Testes de Experiência do Cliente

```
CASO 8.1: Cliente vê dados PIX na tela de sucesso
├─ Pré-condição: Dados configurados, cliente escolhe PIX
├─ Ação: Faz pedido completo com PIX
├─ Esperado:
│  ├─ Tela de sucesso mostra
│  ├─ Seção "Pagamento via PIX" aparece
│  ├─ Dados do banco/titular visíveis
│  └─ Chave PIX copiável
├─ Verificação: Visual conforme guia
└─ Resultado: PASS

CASO 8.2: Cliente copia chave PIX
├─ Ação: Clica no botão copiar
├─ Esperado:
│  ├─ Ícone muda para checkmark verde
│  ├─ Texto "Chave copiada!" aparece
│  ├─ Chave está no clipboard
│  └─ Volta ao normal após 2s
├─ Verificação: Colar em campo confirma
└─ Resultado: PASS

CASO 8.3: Cliente não vê PIX se sem configuração
├─ Pré-condição: PIX não configurado
├─ Ação: Faz pedido com PIX selecionado
├─ Esperado:
│  ├─ Tela de sucesso mostra aviso
│  ├─ Mensagem: "Entre em contato pelo WhatsApp"
│  ├─ Não expõe dados inválidos
│  └─ Direciona para WhatsApp
├─ Verificação: UX segura
└─ Resultado: PASS

CASO 8.4: Outras formas de pagamento não afetadas
├─ Ação: Seleciona "Dinheiro" ou "Cartão"
├─ Esperado:
│  ├─ Seção PIX não aparece
│  ├─ Outras opções funcionam normalmente
│  └─ Fluxo completo funciona
├─ Verificação: Sem erros
└─ Resultado: PASS
```

---

## 🧬 Script de Teste Automatizado

Para testar validações via console:

```javascript
// Salvar no bookmark ou executar no F12

// Validação CPF
function testCPF(cpf) {
  const regex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  return regex.test(cpf)
}

console.log(testCPF("12345678901"))      // true
console.log(testCPF("123.456.789-01"))   // true
console.log(testCPF("123456789"))        // false

// Validação CNPJ
function testCNPJ(cnpj) {
  const regex = /^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
  return regex.test(cnpj)
}

console.log(testCNPJ("12345678000195"))     // true
console.log(testCNPJ("12.345.678/0001-95")) // true

// Validação Email
function testEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

console.log(testEmail("pizza@ramos.com"))    // true
console.log(testEmail("invalido.com"))       // false

// Validação Telefone
function testPhone(phone) {
  const regex = /^\d{10,11}$|^\(\d{2}\)\s?\d{4,5}-\d{4}$/
  return regex.test(phone)
}

console.log(testPhone("11999999999"))       // true
console.log(testPhone("(11) 99999-9999"))   // true
console.log(testPhone("119999999"))         // false
```

---

## 📋 Checklist de Testes Antes do Deploy

- [ ] **Validações**
  - [ ] CPF com/sem formatação
  - [ ] CNPJ com/sem formatação
  - [ ] Email válido/inválido
  - [ ] Telefone com/sem formatação
  - [ ] Campos obrigatórios
  - [ ] Mensagens de erro claras

- [ ] **Interface**
  - [ ] Modal abre e fecha
  - [ ] Campos são preenchidos
  - [ ] Tipos de chave trocam placeholder
  - [ ] Sucesso mostra tela verde
  - [ ] Erros mostram alerta vermelho
  - [ ] Loading spinner funciona
  - [ ] Animations suave

- [ ] **Supabase**
  - [ ] INSERT funciona (primeira vez)
  - [ ] UPDATE funciona (updates)
  - [ ] SELECT carrega dados corretos
  - [ ] Erro tratado gracefully
  - [ ] RLS permitindo operações

- [ ] **Cliente (Store)**
  - [ ] PIX aparece na seleção de pagamento
  - [ ] Dados PIX aparecem em tela sucesso
  - [ ] Botão copiar funciona
  - [ ] Aviso de comprovante está claro
  - [ ] Sem PIX configurado aviso WhatsApp aparece

- [ ] **Mobile**
  - [ ] Modal responsivo em celular
  - [ ] Teclado não quebra layout
  - [ ] Botões são clicáveis
  - [ ] Cópia de chave funciona

---

## 🐛 Debugging Tips

### Ver dados no Supabase
```sql
SELECT * FROM store_settings WHERE key = 'pix_config';
```

### Ver logs no Console (F12)
```javascript
// Veja mensagens de erro
console.log('Error:', error)

// Veja dados sendo salvos
console.log('Saving:', pixConfig)

// Veja dados sendo carregados
console.log('Loaded:', data)
```

### Testar Requisição Supabase
```javascript
// No console do navegador
import { supabase } from './lib/supabase'

async function test() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('key', 'pix_config')
    .single()
  console.log('Data:', data)
  console.log('Error:', error)
}

test()
```

---

**Última atualização:** 2 de fevereiro de 2026
