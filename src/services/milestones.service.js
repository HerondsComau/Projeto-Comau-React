/**
 * Serviço de Milestones
 *
 * Gerencia marcos/entregas do projeto (DR1, DR2, DR3, etc.)
 */

import supabase from '../lib/supabase';

/**
 * Busca todos os milestones de um projeto
 * @param {number} projetoId - ID do projeto
 * @returns {Promise<Array>} Lista de milestones
 */
export async function buscarMilestones(projetoId) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('data_base', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar milestones do projeto ${projetoId}:`, error);
    return { data: null, error };
  }
}

/**
 * Cria um novo milestone
 * @param {Object} milestone - Dados do milestone
 * @returns {Promise<Object>} Milestone criado
 */
export async function criarMilestone({ projeto_id, nome, cor_hex, data_base, is_main = false }) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .insert([
        {
          projeto_id,
          nome,
          cor_hex: cor_hex || '#0D9488',
          percentual: 0,
          data_base,
          is_main
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Milestone criado:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar milestone:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza um milestone
 * @param {number} id - ID do milestone
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>} Milestone atualizado
 */
export async function atualizarMilestone(id, updates) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Milestone atualizado:', data);
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar milestone ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Exclui um milestone
 * @param {number} id - ID do milestone
 * @returns {Promise<Object>} Resultado da operação
 */
export async function excluirMilestone(id) {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Milestone excluído:', id);
    return { data: { id }, error: null };
  } catch (error) {
    console.error(`Erro ao excluir milestone ${id}:`, error);
    return { data: null, error };
  }
}
