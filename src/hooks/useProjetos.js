/**
 * Hook para gerenciar projetos
 *
 * Facilita o uso do serviço de projetos em componentes React.
 * Inclui loading states, error handling e cache automático.
 */

import { useState, useEffect } from 'react';
import * as projetosService from '../services/projetos.service';

/**
 * Hook para buscar todos os projetos
 */
export function useProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarProjetos = async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await projetosService.buscarProjetos();

    if (err) {
      setError(err);
      setProjetos([]);
    } else {
      setProjetos(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  return {
    projetos,
    loading,
    error,
    recarregar: carregarProjetos
  };
}

/**
 * Hook para buscar um projeto específico
 * @param {number} id - ID do projeto
 */
export function useProjeto(id) {
  const [projeto, setProjeto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const carregarProjeto = async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await projetosService.buscarProjetoPorId(id);

      if (err) {
        setError(err);
        setProjeto(null);
      } else {
        setProjeto(data);
      }

      setLoading(false);
    };

    carregarProjeto();
  }, [id]);

  return { projeto, loading, error };
}

/**
 * Hook para operações de CRUD de projetos
 */
export function useProjetoActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const criar = async (dadosProjeto) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await projetosService.criarProjeto(dadosProjeto);

    setLoading(false);

    if (err) {
      setError(err);
      return { success: false, data: null, error: err };
    }

    return { success: true, data, error: null };
  };

  const atualizar = async (id, updates) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await projetosService.atualizarProjeto(id, updates);

    setLoading(false);

    if (err) {
      setError(err);
      return { success: false, data: null, error: err };
    }

    return { success: true, data, error: null };
  };

  const atualizarInfo = async (projetoId, info) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await projetosService.atualizarProjetoInfo(projetoId, info);

    setLoading(false);

    if (err) {
      setError(err);
      return { success: false, data: null, error: err };
    }

    return { success: true, data, error: null };
  };

  const desativar = async (id) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await projetosService.desativarProjeto(id);

    setLoading(false);

    if (err) {
      setError(err);
      return { success: false, data: null, error: err };
    }

    return { success: true, data, error: null };
  };

  return {
    loading,
    error,
    criar,
    atualizar,
    atualizarInfo,
    desativar
  };
}
