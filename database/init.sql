-- Schema para o sistema de gerenciamento de projetos Comau
-- Este script é executado automaticamente na primeira inicialização do container PostgreSQL

-- Criação da extensão UUID (opcional, para gerar IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cliente VARCHAR(255),
    logo_id VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Informações do Projeto (dados adicionais)
CREATE TABLE IF NOT EXISTS projeto_info (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    centro_custo VARCHAR(100),
    planta VARCHAR(255),
    area VARCHAR(100),
    design_leader VARCHAR(255),
    technical_leader VARCHAR(255),
    UNIQUE(projeto_id)
);

-- Tabela de Milestones/Classes
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cor_hex VARCHAR(7) DEFAULT '#0D9488',
    percentual INTEGER DEFAULT 0 CHECK (percentual >= 0 AND percentual <= 100),
    data_base DATE,
    is_main BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
    id SERIAL PRIMARY KEY,
    milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo INTEGER DEFAULT 0, -- 0: Mecânico, 1: Elétrico, 2: Software, 3: Ferramental, 99: Outro
    nivel_prioridade INTEGER DEFAULT 2, -- 1: Baixa, 2: Média, 3: Alta, 4: Crítica

    -- Percentuais de progresso
    dr1_percentual INTEGER DEFAULT 0 CHECK (dr1_percentual >= 0 AND dr1_percentual <= 100),
    dr2_percentual INTEGER DEFAULT 0 CHECK (dr2_percentual >= 0 AND dr2_percentual <= 100),
    dr3_percentual INTEGER DEFAULT 0 CHECK (dr3_percentual >= 0 AND dr3_percentual <= 100),
    dois_d_percentual INTEGER DEFAULT 0 CHECK (dois_d_percentual >= 0 AND dois_d_percentual <= 100),
    plano_sequencia_percentual INTEGER DEFAULT 0 CHECK (plano_sequencia_percentual >= 0 AND plano_sequencia_percentual <= 100),
    release_percentual INTEGER DEFAULT 0 CHECK (release_percentual >= 0 AND release_percentual <= 100),

    -- Datas planejadas
    dr1_planejado DATE,
    dr2_planejado DATE,
    dr3_planejado DATE,
    dois_d_planejado DATE,
    plano_sequencia_planejado DATE,
    release_planejado DATE,

    -- Datas realizadas
    dr1_realizado TIMESTAMP,
    dr2_realizado TIMESTAMP,
    dr3_realizado TIMESTAMP,
    dois_d_realizado TIMESTAMP,
    plano_sequencia_realizado TIMESTAMP,
    release_realizado TIMESTAMP,

    -- Status e flags
    status_manual VARCHAR(50) DEFAULT 'NoPrazo',
    status_override VARCHAR(50),
    standby BOOLEAN DEFAULT false,
    release_ok BOOLEAN DEFAULT false,

    -- Imagem
    imagem_data_url TEXT,
    imagem_path VARCHAR(500),

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Checklists (DR1, DR2, DR3)
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    fase VARCHAR(20) NOT NULL, -- 'DR1', 'DR2', 'DR3'
    itens JSONB DEFAULT '[]'::jsonb,
    UNIQUE(projeto_id, fase)
);

-- Tabela de Recursos
CREATE TABLE IF NOT EXISTS recursos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    horas_disponiveis INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alocação de Recursos
CREATE TABLE IF NOT EXISTS recurso_alocacao (
    id SERIAL PRIMARY KEY,
    recurso_id INTEGER NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    dispositivo_id INTEGER NOT NULL REFERENCES dispositivos(id) ON DELETE CASCADE,
    horas_alocadas INTEGER DEFAULT 0,
    data_inicio DATE,
    data_fim DATE
);

-- Tabela de Snapshots (progresso ao longo do tempo)
CREATE TABLE IF NOT EXISTS snapshots (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    media_progresso DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_dispositivos_milestone ON dispositivos(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestones_projeto ON milestones(projeto_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_projeto ON snapshots(projeto_id);
CREATE INDEX IF NOT EXISTS idx_projeto_info_projeto ON projeto_info(projeto_id);
CREATE INDEX IF NOT EXISTS idx_checklists_projeto ON checklists(projeto_id);

-- Trigger para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispositivos_updated_at BEFORE UPDATE ON dispositivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados de exemplo (opcional - remover em produção)
INSERT INTO projetos (nome, cliente, logo_id) VALUES
    ('Projeto Demo', 'FIAT Betim', 'fiat')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE projetos IS 'Tabela principal de projetos';
COMMENT ON TABLE dispositivos IS 'Dispositivos/componentes de cada projeto';
COMMENT ON TABLE milestones IS 'Marcos/entregas principais (DR1, DR2, DR3, etc)';
COMMENT ON TABLE snapshots IS 'Histórico de progresso dos projetos';
