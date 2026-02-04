/**
 * Serviço de Projetos
 *
 * Abstrai todas as operações relacionadas a projetos no Supabase.
 * Segue padrão Repository para facilitar manutenção e testes.
 */

import supabase from '../lib/supabase';

/**
 * Busca todos os projetos ativos
 * @returns {Promise<Array>} Lista de projetos
 */
export async function buscarProjetos() {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        projeto_info (*)
      `)
      .eq('ativo', true)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return { data: null, error };
  }
}

/**
 * Busca um projeto específico por ID
 * @param {number} id - ID do projeto
 * @returns {Promise<Object>} Projeto encontrado
 */
export async function buscarProjetoPorId(id) {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        projeto_info (*),
        milestones (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Cria um novo projeto
 * @param {Object} projeto - Dados do projeto
 * @param {string} projeto.nome - Nome do projeto
 * @param {string} projeto.cliente - Nome do cliente
 * @param {string} projeto.logo_id - ID do logo selecionado
 * @returns {Promise<Object>} Projeto criado
 */
export async function criarProjeto({ nome, cliente, logo_id }) {
  try {
    // 1. Criar projeto principal
    const { data: projeto, error: erroProjeto } = await supabase
      .from('projetos')
      .insert([
        {
          nome,
          cliente,
          logo_id: logo_id || 'comau',
          ativo: true
        }
      ])
      .select()
      .single();

    if (erroProjeto) throw erroProjeto;

    // 2. Criar registro de informações do projeto (vazio inicialmente)
    const { error: erroInfo } = await supabase
      .from('projeto_info')
      .insert([
        {
          projeto_id: projeto.id,
          centro_custo: null,
          planta: null,
          area: null,
          design_leader: null,
          technical_leader: null
        }
      ]);

    if (erroInfo) {
      console.warn('Aviso ao criar projeto_info:', erroInfo);
    }

    console.log('✅ Projeto criado com sucesso:', projeto);
    return { data: projeto, error: null };
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza informações de um projeto
 * @param {number} id - ID do projeto
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>} Projeto atualizado
 */
export async function atualizarProjeto(id, updates) {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Projeto atualizado:', data);
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar projeto ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Atualiza informações adicionais do projeto (projeto_info)
 * @param {number} projetoId - ID do projeto
 * @param {Object} info - Informações adicionais
 * @returns {Promise<Object>} Info atualizado
 */
export async function atualizarProjetoInfo(projetoId, info) {
  try {
    const { data, error } = await supabase
      .from('projeto_info')
      .upsert(
        {
          projeto_id: projetoId,
          ...info
        },
        {
          onConflict: 'projeto_id'
        }
      )
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Informações do projeto atualizadas:', data);
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar info do projeto ${projetoId}:`, error);
    return { data: null, error };
  }
}

/**
 * Desativa um projeto (soft delete)
 * @param {number} id - ID do projeto
 * @returns {Promise<Object>} Resultado da operação
 */
export async function desativarProjeto(id) {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Projeto desativado:', data);
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao desativar projeto ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Exclui permanentemente um projeto (use com cuidado!)
 * @param {number} id - ID do projeto
 * @returns {Promise<Object>} Resultado da operação
 */
export async function excluirProjeto(id) {
  try {
    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Projeto excluído permanentemente:', id);
    return { data: { id }, error: null };
  } catch (error) {
    console.error(`Erro ao excluir projeto ${id}:`, error);
    return { data: null, error };
  }
}
