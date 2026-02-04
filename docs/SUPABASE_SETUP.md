# 🗄️ Guia de Configuração do Supabase

Este guia explica como conectar sua aplicação React/Vite ao banco de dados Supabase.

---

## ✅ Pré-requisitos

Você já completou:
- ✅ Banco de dados criado no Supabase
- ✅ Script `database/init.sql` executado
- ✅ Todas as tabelas criadas com sucesso
- ✅ Conexão testada via SQLTools no VS Code

Agora vamos conectar o frontend ao Supabase!

---

## 🔧 Passo 1: Obter Credenciais do Supabase

### 1.1. Acessar o Dashboard do Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto

### 1.2. Copiar a URL do Projeto
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **API**
3. Na seção **Project URL**, copie a URL:
   ```
   https://[seu-project-id].supabase.co
   ```

### 1.3. Copiar a Anon Key
1. Na mesma página (Settings > API)
2. Na seção **Project API keys**, copie a chave **`anon` / `public`**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

⚠️ **IMPORTANTE**: Use APENAS a **anon/public key** no frontend, NUNCA a service_role key!

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1. Criar arquivo `.env`

Na raiz do projeto, crie um arquivo `.env` (se ainda não existir):

```bash
# Copiar do .env.example
cp .env.example .env
```

### 2.2. Editar o arquivo `.env`

Abra o arquivo `.env` e substitua os valores:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUA-ANON-KEY-AQUI

# Opcionais
VITE_DEV_MODE=true
VITE_ENABLE_REALTIME=true
```

### 2.3. Adicionar `.env` ao `.gitignore`

⚠️ **NUNCA commite o arquivo `.env` no Git!**

Verifique se `.env` está no `.gitignore`:

```gitignore
# .gitignore
.env
.env.local
```

---

## 🚀 Passo 3: Testar a Conexão

### 3.1. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 3.2. Abrir o Console do Navegador

Abra `http://localhost:5173` e abra o Console do DevTools (F12).

Você deve ver:
```
✅ Supabase client initialized
📍 URL: https://seu-project-id.supabase.co
🔑 Using anon key (safe for frontend)
```

### 3.3. Testar Criação de Projeto

1. Na aplicação, clique no botão **"+"**
2. Preencha o formulário de Setup Inicial:
   - Nome do Projeto
   - Cliente
   - Logo do Cliente
3. Clique em **"Criar Projeto"**

Se tudo funcionar, você verá:
```
✅ Projeto criado no Supabase: { id: 1, nome: "...", ... }
✅ Projeto criado com sucesso!
```

### 3.4. Verificar no Supabase Dashboard

1. Vá para o Supabase Dashboard
2. Clique em **Table Editor** no menu lateral
3. Selecione a tabela **`projetos`**
4. Você deve ver o projeto criado!

---

## 🏗️ Arquitetura Implementada

### Estrutura de Arquivos

```
src/
├── lib/
│   └── supabase.js              # 🔧 Cliente Supabase configurado
├── services/
│   ├── projetos.service.js      # 📦 CRUD de projetos
│   └── milestones.service.js    # 📦 CRUD de milestones
├── hooks/
│   └── useProjetos.js           # 🪝 Hooks React customizados
└── aplicacao.jsx                # 🎨 Componentes React
```

### Fluxo de Dados

```
React Component (UI)
       ↓
Custom Hook (useProjetos)
       ↓
Service (projetos.service)
       ↓
Supabase Client (lib/supabase)
       ↓
Supabase API (REST)
       ↓
PostgreSQL Database ☁️
```

---

## 📚 Guia de Uso da API

### Criar Projeto

```javascript
import { useProjetoActions } from './hooks/useProjetos';

function MeuComponente() {
  const { criar, loading } = useProjetoActions();

  const handleCriar = async () => {
    const resultado = await criar({
      nome: "Projeto Teste",
      cliente: "FIAT",
      logo_id: "fiat"
    });

    if (resultado.success) {
      console.log("Projeto criado:", resultado.data);
    }
  };

  return (
    <button onClick={handleCriar} disabled={loading}>
      {loading ? "Criando..." : "Criar Projeto"}
    </button>
  );
}
```

### Buscar Projetos

```javascript
import { useProjetos } from './hooks/useProjetos';

function ListaProjetos() {
  const { projetos, loading, error } = useProjetos();

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error.message}</p>;

  return (
    <ul>
      {projetos.map(p => (
        <li key={p.id}>{p.nome} - {p.cliente}</li>
      ))}
    </ul>
  );
}
```

### Atualizar Projeto

```javascript
const { atualizar } = useProjetoActions();

await atualizar(projetoId, {
  nome: "Novo Nome",
  cliente: "Novo Cliente"
});
```

---

## 🔒 Segurança: Row Level Security (RLS)

Por padrão, o Supabase bloqueia todo acesso às tabelas. Você precisa configurar **Row Level Security (RLS)**.

### Habilitar Acesso Público (Para Desenvolvimento)

⚠️ **Apenas para desenvolvimento/teste! Em produção, configure RLS adequadamente.**

Execute no Supabase SQL Editor:

```sql
-- Permitir SELECT (leitura) para todos
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON projetos FOR SELECT TO public USING (true);

-- Permitir INSERT (criação) para todos
CREATE POLICY "Allow public insert" ON projetos FOR INSERT TO public WITH CHECK (true);

-- Permitir UPDATE (atualização) para todos
CREATE POLICY "Allow public update" ON projetos FOR UPDATE TO public USING (true);

-- Repetir para outras tabelas
ALTER TABLE projeto_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON projeto_info FOR ALL TO public USING (true);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON milestones FOR ALL TO public USING (true);

ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON dispositivos FOR ALL TO public USING (true);
```

### Configurar RLS para Produção (Recomendado)

```sql
-- Apenas usuários autenticados podem criar/editar
CREATE POLICY "Authenticated users can insert"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuários só podem ver seus próprios projetos
CREATE POLICY "Users see own projects"
ON projetos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Verifique se o arquivo `.env` existe e contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### Erro: "Failed to fetch" ou "Network error"

**Possíveis causas**:
1. URL do Supabase incorreta
2. Anon key incorreta
3. Sem conexão com internet
4. Firewall bloqueando Supabase

**Solução**: Verifique as credenciais e teste a conexão:

```javascript
import { checkConnection } from './lib/supabase';
await checkConnection();
```

### Erro: "new row violates row-level security policy"

**Causa**: RLS está habilitado mas sem políticas configuradas.

**Solução**: Configure políticas RLS (veja seção "Segurança" acima).

### Projetos não aparecem na UI

**Causa**: Dados estão no Supabase mas o código legado usa localStorage.

**Solução**: O sistema está em **modo híbrido** durante a migração:
- Novos projetos → Salvos no Supabase + localStorage
- Projetos antigos → Apenas no localStorage

Para migrar projetos antigos para Supabase, crie um script de migração.

---

## 🔄 Sistema Híbrido (Transição)

Atualmente, o sistema funciona em **modo híbrido**:

1. **Criação de Projeto**:
   - ✅ Tenta criar no Supabase primeiro
   - ✅ Se sucesso, também salva no localStorage (compatibilidade)
   - ⚠️ Se falhar, usa localStorage como fallback

2. **Leitura de Projetos**:
   - Código legado ainda lê do localStorage
   - Novos componentes podem ler do Supabase via hooks

### Próximos Passos (Migração Completa)

Para migrar completamente para Supabase:

1. **Migrar dados existentes**:
   - Exportar projetos do localStorage
   - Importar para Supabase

2. **Atualizar código legado**:
   - Modificar `ponte.js` para ler do Supabase
   - Remover dependência de localStorage

3. **Sincronização em tempo real**:
   - Habilitar Supabase Realtime
   - Atualizar UI automaticamente

---

## 📊 Monitoramento

### Ver Requisições no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Database** > **API logs**
3. Veja todas as requisições em tempo real

### Logs no Console do Navegador

Em modo dev (`VITE_DEV_MODE=true`), você verá logs detalhados:

```
✅ Supabase client initialized
✅ Projeto criado no Supabase: {...}
⚠️ Usando localStorage como fallback
```

---

## 🎉 Conclusão

Sua aplicação agora está conectada ao Supabase!

**Recursos disponíveis**:
- ✅ Criar projetos no banco de dados na nuvem
- ✅ Hooks React para fácil integração
- ✅ Fallback para localStorage (offline)
- ✅ Logging detalhado para debug

**Próximos passos recomendados**:
1. Configurar RLS para produção
2. Implementar autenticação de usuários
3. Migrar dados existentes do localStorage
4. Adicionar mais serviços (dispositivos, milestones)

---

**Dúvidas?** Consulte a [documentação oficial do Supabase](https://supabase.com/docs).
