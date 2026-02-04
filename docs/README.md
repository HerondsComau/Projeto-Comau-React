# Comau Project Governance Suite

Sistema de gerenciamento de projetos corporativos com interface moderna inspirada no iOS + banco de dados na nuvem (Supabase).

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ e npm
- Conta no Supabase (gratuita)

### Instalação

1. **Clone o repositório e instale dependências:**
```bash
npm install
```

2. **Configure o banco de dados Supabase:**

   a. Crie uma conta em https://supabase.com

   b. Crie um novo projeto

   c. Execute o script SQL inicial:
   - Abra o SQL Editor no Supabase Dashboard
   - Cole e execute o conteúdo de `database/init.sql`
   - Depois execute `database/rls-policies.sql`

   d. Copie as credenciais:
   ```bash
   cp .env.example .env
   ```

   e. Edite o arquivo `.env` e preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```

📖 **Guia detalhado**: Veja [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) para instruções completas.

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 📁 Estrutura do Projeto

```
├── src/
│   ├── aplicacao.jsx          # Componente React principal
│   ├── estilos.css            # Estilos globais (iOS-inspired)
│   ├── legado/
│   │   ├── controle.js        # Lógica de controle e roteamento
│   │   ├── visual.js          # Funções de renderização
│   │   └── ponte.js           # Bridge para localStorage/state
│   └── main.jsx               # Entry point
├── public/
│   └── assets/                # Logos e imagens
├── database/
│   └── init.sql               # Schema do banco de dados
├── docker-compose.yml         # Configuração Docker
└── .env.example               # Variáveis de ambiente de exemplo
```

## 🎯 Funcionalidades

### ✅ Implementadas
- **Central de Controle**: Dashboard com cards iOS-style
- **Setup Inicial**: Modal de criação de projetos com seleção de logo
- **Departamento Mecânica**:
  - Setup de configurações específicas
  - Gestão de dispositivos
  - Cronograma e milestones
  - Dashboard com gráficos
  - Kanban de tarefas
- **Departamento Simulação**: Gestão de análises e liberações
- **Animações iOS**: Transições fluidas entre views
- **Bloqueio de acesso**: Requer projeto criado antes de acessar departamentos

### 🔄 Em Desenvolvimento
- ✅ Integração com Supabase (PostgreSQL na nuvem)
- 🔄 Migração completa do localStorage para Supabase
- 🔄 Autenticação de usuários (Supabase Auth)
- 🔄 Sincronização em tempo real (Supabase Realtime)
- 🔄 Relatórios exportáveis

## 🗄️ Banco de Dados (Supabase)

### Acesso ao Banco

- **Dashboard**: https://supabase.com/dashboard
- **Table Editor**: Visualizar/editar dados diretamente
- **SQL Editor**: Executar queries SQL
- **API Logs**: Monitorar requisições em tempo real

### Backup e Restore

**Backup via Supabase CLI:**
```bash
supabase db dump -f backup.sql
```

**Restore:**
```bash
supabase db push backup.sql
```

Ou use o Supabase Dashboard: Settings > Database > Backups

### Conexão Direta via PostgreSQL

Se precisar conectar diretamente (ex: via psql, DBeaver, TablePlus):

```bash
psql "postgresql://postgres.seu-project-id:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

**Credenciais**: Encontre em Settings > Database > Connection string

## 🎨 Design System

O sistema utiliza um design inspirado no iOS com:
- **Cores corporativas**: Azul, branco e cinza
- **Animações fluidas**: cubic-bezier(0.19, 1, 0.22, 1)
- **Cards com profundidade**: Sombras sutis e hover states
- **Expansão contextual**: Cards expandem para fullscreen
- **Feedback visual**: Estados de loading, sucesso e erro

## 📝 Fluxo de Uso

1. **Primeira Inicialização**:
   - Sistema detecta ausência de projetos
   - Cards aparecem bloqueados visualmente
   - Usuário é direcionado a criar um projeto via botão "+"

2. **Criação de Projeto**:
   - Modal de Setup Inicial abre com animação
   - Preenchimento: Nome, Cliente, Logo
   - Projeto é criado e cards são desbloqueados

3. **Navegação nos Departamentos**:
   - Click em card → Expansão suave para fullscreen
   - Acesso às funcionalidades específicas
   - Botão voltar restaura Central de Controle

## 🔧 Tecnologias

- **Frontend**: React 19, Vite, Framer Motion
- **Styling**: CSS customizado (iOS-inspired)
- **State**: Supabase (PostgreSQL na nuvem) + localStorage (fallback)
- **Backend**: Supabase (PostgreSQL + REST API + Realtime)
- **Banco de Dados**: PostgreSQL 15+ (via Supabase)
- **Gráficos**: Chart.js
- **Sincronização**: BroadcastChannel (cross-tab)

## 📄 Licença

Propriedade da Comau. Todos os direitos reservados.

## 👥 Contribuindo

Este é um projeto interno. Para contribuir, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido por**: Equipe de Engenharia Comau
**Versão**: 2.0
**Última atualização**: 2026-02-02
