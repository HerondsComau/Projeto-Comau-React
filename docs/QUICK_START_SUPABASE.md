# ⚡ Quick Start: Conectando ao Supabase

**5 minutos para ter seu projeto conectado ao banco de dados na nuvem!**

---

## ✅ O Que Já Está Feito

- ✅ Código integrado com Supabase
- ✅ Serviços e hooks React prontos
- ✅ Fallback para localStorage
- ✅ Animações iOS funcionando
- ✅ Build de produção OK

---

## 🚀 3 Passos Para Conectar

### **PASSO 1: Obter Credenciais do Supabase** (2 min)

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL**: `https://[id].supabase.co`
   - **anon/public key**: `eyJhbGci...`

### **PASSO 2: Configurar `.env`** (1 min)

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-ANON-KEY-COMPLETA-AQUI
VITE_DEV_MODE=true
```

### **PASSO 3: Habilitar RLS** (2 min)

No Supabase SQL Editor, execute:

```sql
-- Copie e cole todo o conteúdo de database/rls-policies.sql
```

Ou simplesmente execute:
```sql
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON projetos FOR ALL TO public USING (true);

ALTER TABLE projeto_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON projeto_info FOR ALL TO public USING (true);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON milestones FOR ALL TO public USING (true);
```

---

## ✨ Testar

```bash
npm run dev
```

1. Abra http://localhost:5173
2. Clique no botão **"+"**
3. Preencha o formulário
4. Clique em **"Criar Projeto"**

Deve aparecer: **"✅ Projeto criado com sucesso!"**

---

## 🔍 Verificar se Funcionou

### No Console do Navegador (F12)

Você deve ver:
```
✅ Supabase client initialized
📍 URL: https://seu-project-id.supabase.co
✅ Projeto criado no Supabase: { id: 1, nome: "...", ... }
```

### No Supabase Dashboard

1. Vá para **Table Editor**
2. Selecione a tabela `projetos`
3. Veja o projeto criado! 🎉

---

## 📚 Documentação Completa

- **Setup Detalhado**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Exemplos de Código**: [EXEMPLOS_SUPABASE.md](./EXEMPLOS_SUPABASE.md)
- **README Geral**: [README.md](./README.md)

---

## 🐛 Problemas Comuns

### "Missing Supabase environment variables"
**Solução**: Verifique se o arquivo `.env` existe e está preenchido.

### "Failed to fetch"
**Solução**: Verifique se a URL e a anon key estão corretas.

### "new row violates row-level security policy"
**Solução**: Execute o script `database/rls-policies.sql` no Supabase.

### Projeto não aparece na UI
**Solução**: O sistema está em modo híbrido. Recarregue a página (F5).

---

## 🎯 Próximos Passos

Agora que está funcionando:

1. **Explore os exemplos**: Veja [EXEMPLOS_SUPABASE.md](./EXEMPLOS_SUPABASE.md)
2. **Migre mais funcionalidades**: Dispositivos, Milestones, etc.
3. **Adicione autenticação**: Supabase Auth (opcional)
4. **Deploy em produção**: Vercel, Netlify, ou Supabase Hosting

---

**🎉 Parabéns! Seu projeto agora está na nuvem!** ☁️
