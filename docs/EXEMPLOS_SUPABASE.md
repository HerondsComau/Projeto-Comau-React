# 📚 Exemplos de Uso do Supabase

Este documento contém exemplos práticos de como usar o Supabase no seu projeto.

---

## 📋 Índice

1. [Criar Projeto](#1-criar-projeto)
2. [Listar Projetos](#2-listar-projetos)
3. [Atualizar Projeto](#3-atualizar-projeto)
4. [Criar Milestone](#4-criar-milestone)
5. [Filtrar e Buscar](#5-filtrar-e-buscar)
6. [Realtime (Tempo Real)](#6-realtime-tempo-real)
7. [Upload de Imagens](#7-upload-de-imagens)

---

## 1. Criar Projeto

### Usando Hook

```javascript
import { useProjetoActions } from './hooks/useProjetos';

function FormularioProjeto() {
  const { criar, loading, error } = useProjetoActions();
  const [nome, setNome] = useState('');
  const [cliente, setCliente] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultado = await criar({
      nome,
      cliente,
      logo_id: 'fiat'
    });

    if (resultado.success) {
      alert(`✅ Projeto criado! ID: ${resultado.data.id}`);
      setNome('');
      setCliente('');
    } else {
      alert(`❌ Erro: ${resultado.error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do Projeto"
        required
      />
      <input
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        placeholder="Cliente"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Projeto'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### Usando Service Diretamente

```javascript
import { criarProjeto } from './services/projetos.service';

const { data, error } = await criarProjeto({
  nome: 'Projeto Teste',
  cliente: 'FIAT Betim',
  logo_id: 'fiat'
});

if (data) {
  console.log('Projeto criado:', data);
}
```

---

## 2. Listar Projetos

### Usando Hook (Recomendado)

```javascript
import { useProjetos } from './hooks/useProjetos';

function ListaProjetos() {
  const { projetos, loading, error, recarregar } = useProjetos();

  if (loading) {
    return <div>Carregando projetos...</div>;
  }

  if (error) {
    return <div>Erro ao carregar: {error.message}</div>;
  }

  return (
    <div>
      <button onClick={recarregar}>🔄 Recarregar</button>

      {projetos.length === 0 ? (
        <p>Nenhum projeto encontrado.</p>
      ) : (
        <ul>
          {projetos.map(projeto => (
            <li key={projeto.id}>
              <h3>{projeto.nome}</h3>
              <p>Cliente: {projeto.cliente}</p>
              <p>Criado em: {new Date(projeto.criado_em).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Buscar Projeto Específico

```javascript
import { useProjeto } from './hooks/useProjetos';

function DetalhesProjeto({ projetoId }) {
  const { projeto, loading, error } = useProjeto(projetoId);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!projeto) return <div>Projeto não encontrado</div>;

  return (
    <div>
      <h1>{projeto.nome}</h1>
      <p>Cliente: {projeto.cliente}</p>

      {/* Milestones do projeto */}
      <h2>Milestones</h2>
      {projeto.milestones?.map(m => (
        <div key={m.id}>
          <strong>{m.nome}</strong> - {m.percentual}%
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Atualizar Projeto

### Atualizar Informações Básicas

```javascript
import { useProjetoActions } from './hooks/useProjetos';

function EditarProjeto({ projetoId }) {
  const { atualizar, loading } = useProjetoActions();

  const handleSalvar = async () => {
    const resultado = await atualizar(projetoId, {
      nome: 'Novo Nome',
      cliente: 'Novo Cliente'
    });

    if (resultado.success) {
      alert('✅ Projeto atualizado!');
    }
  };

  return (
    <button onClick={handleSalvar} disabled={loading}>
      {loading ? 'Salvando...' : 'Salvar Alterações'}
    </button>
  );
}
```

### Atualizar Informações Adicionais (Setup)

```javascript
const { atualizarInfo } = useProjetoActions();

await atualizarInfo(projetoId, {
  centro_custo: '123456',
  planta: 'Betim - MG',
  area: 'Body Shop',
  design_leader: 'João Silva',
  technical_leader: 'Maria Santos'
});
```

---

## 4. Criar Milestone

### Criar Service de Milestones

Primeiro, importe o service:

```javascript
import { criarMilestone } from './services/milestones.service';

const { data, error } = await criarMilestone({
  projeto_id: 1,
  nome: 'DR1',
  cor_hex: '#10b981',
  data_base: '2026-03-15',
  is_main: true
});

if (data) {
  console.log('Milestone criado:', data);
}
```

### Hook Customizado para Milestones

Crie um arquivo `src/hooks/useMilestones.js`:

```javascript
import { useState, useEffect } from 'react';
import * as milestonesService from '../services/milestones.service';

export function useMilestones(projetoId) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projetoId) return;

    const carregar = async () => {
      setLoading(true);
      const { data, error: err } = await milestonesService.buscarMilestones(projetoId);

      if (err) {
        setError(err);
      } else {
        setMilestones(data || []);
      }

      setLoading(false);
    };

    carregar();
  }, [projetoId]);

  return { milestones, loading, error };
}
```

### Usar no Componente

```javascript
import { useMilestones } from './hooks/useMilestones';

function ListaMilestones({ projetoId }) {
  const { milestones, loading } = useMilestones(projetoId);

  if (loading) return <div>Carregando milestones...</div>;

  return (
    <ul>
      {milestones.map(m => (
        <li key={m.id} style={{ color: m.cor_hex }}>
          <strong>{m.nome}</strong> - {m.percentual}% completo
          <br />
          Data base: {new Date(m.data_base).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

---

## 5. Filtrar e Buscar

### Buscar Projetos por Cliente

```javascript
import supabase from './lib/supabase';

const { data, error } = await supabase
  .from('projetos')
  .select('*')
  .eq('cliente', 'FIAT')
  .eq('ativo', true);
```

### Buscar Projetos por Nome (Contém)

```javascript
const { data, error } = await supabase
  .from('projetos')
  .select('*')
  .ilike('nome', '%body shop%'); // Case-insensitive LIKE
```

### Buscar com Relacionamentos

```javascript
// Buscar projetos com suas informações e milestones
const { data, error } = await supabase
  .from('projetos')
  .select(`
    *,
    projeto_info (*),
    milestones (*)
  `)
  .eq('ativo', true)
  .order('criado_em', { ascending: false });
```

### Buscar Milestones Futuros

```javascript
const hoje = new Date().toISOString().split('T')[0];

const { data, error } = await supabase
  .from('milestones')
  .select('*, projetos(nome, cliente)')
  .gte('data_base', hoje) // >= hoje
  .order('data_base', { ascending: true })
  .limit(10);
```

---

## 6. Realtime (Tempo Real)

### Escutar Mudanças em Tempo Real

```javascript
import { useEffect, useState } from 'react';
import supabase from './lib/supabase';

function ProjetosRealtime() {
  const [projetos, setProjetos] = useState([]);

  useEffect(() => {
    // Carregar projetos iniciais
    const carregarProjetos = async () => {
      const { data } = await supabase
        .from('projetos')
        .select('*')
        .eq('ativo', true);
      setProjetos(data || []);
    };

    carregarProjetos();

    // Escutar mudanças em tempo real
    const subscription = supabase
      .channel('projetos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'projetos'
        },
        (payload) => {
          console.log('Mudança detectada:', payload);

          if (payload.eventType === 'INSERT') {
            setProjetos(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setProjetos(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProjetos(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ul>
      {projetos.map(p => (
        <li key={p.id}>{p.nome}</li>
      ))}
    </ul>
  );
}
```

---

## 7. Upload de Imagens

### Configurar Storage no Supabase

1. No Supabase Dashboard, vá em **Storage**
2. Crie um bucket chamado `project-images`
3. Configure as políticas de acesso

### Upload de Imagem

```javascript
import supabase from './lib/supabase';

async function uploadLogo(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(filePath, file);

  if (error) {
    console.error('Erro no upload:', error);
    return null;
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Usar no componente
function UploadLogo({ projetoId }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadLogo(file);
    if (url) {
      // Salvar URL no banco
      await supabase
        .from('projetos')
        .update({ logo_url: url })
        .eq('id', projetoId);

      alert('Logo atualizado!');
    }
  };

  return <input type="file" accept="image/*" onChange={handleFileChange} />;
}
```

---

## 🎯 Próximos Passos

Agora que você domina o básico, explore:

1. **Autenticação**: Implementar login de usuários
2. **RLS Avançado**: Políticas de segurança por usuário
3. **Edge Functions**: Lógica backend serverless
4. **Full-Text Search**: Busca avançada de texto

📚 **Documentação completa**: https://supabase.com/docs

---

**Dúvidas?** Consulte [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para mais detalhes.
