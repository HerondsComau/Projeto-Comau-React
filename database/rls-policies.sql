-- ========================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS
-- ========================================
--
-- Execute este script no Supabase SQL Editor para habilitar
-- acesso às tabelas via frontend.
--
-- ⚠️ IMPORTANTE: Este script é para DESENVOLVIMENTO/TESTE.
-- Para PRODUÇÃO, implemente políticas mais restritivas baseadas
-- em autenticação de usuários.
--

-- ========================================
-- TABELA: projetos
-- ========================================

-- Habilitar RLS
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT (leitura) para todos
CREATE POLICY "Allow public read projetos"
ON projetos
FOR SELECT
TO public
USING (true);

-- Permitir INSERT (criação) para todos
CREATE POLICY "Allow public insert projetos"
ON projetos
FOR INSERT
TO public
WITH CHECK (true);

-- Permitir UPDATE (atualização) para todos
CREATE POLICY "Allow public update projetos"
ON projetos
FOR UPDATE
TO public
USING (true);

-- Permitir DELETE (exclusão) para todos
CREATE POLICY "Allow public delete projetos"
ON projetos
FOR DELETE
TO public
USING (true);

-- ========================================
-- TABELA: projeto_info
-- ========================================

ALTER TABLE projeto_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on projeto_info"
ON projeto_info
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: milestones
-- ========================================

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on milestones"
ON milestones
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: dispositivos
-- ========================================

ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on dispositivos"
ON dispositivos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: checklists
-- ========================================

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on checklists"
ON checklists
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: recursos
-- ========================================

ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on recursos"
ON recursos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: recurso_alocacao
-- ========================================

ALTER TABLE recurso_alocacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on recurso_alocacao"
ON recurso_alocacao
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- TABELA: snapshots
-- ========================================

ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on snapshots"
ON snapshots
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Para verificar se as políticas foram criadas corretamente,
-- execute a query abaixo:

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- EXEMPLO: POLÍTICAS PARA PRODUÇÃO
-- ========================================
--
-- Para produção, use políticas baseadas em autenticação:
--
-- -- Apenas usuários autenticados podem criar projetos
-- CREATE POLICY "Authenticated users can insert"
-- ON projetos FOR INSERT
-- TO authenticated
-- WITH CHECK (true);
--
-- -- Usuários só podem ver projetos que criaram
-- CREATE POLICY "Users see own projects"
-- ON projetos FOR SELECT
-- TO authenticated
-- USING (auth.uid() = user_id);
--
-- -- Usuários só podem editar seus próprios projetos
-- CREATE POLICY "Users update own projects"
-- ON projetos FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id);
--
-- NOTA: Você precisará adicionar uma coluna 'user_id' nas tabelas
-- e vinculá-la ao auth.uid() do Supabase Auth.
