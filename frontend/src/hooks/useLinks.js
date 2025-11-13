import { useState, useEffect, useCallback } from 'react';
import { linksAPI, categoriesAPI, tagsAPI, variablesAPI } from '../services/api';

/**
 * Hook customizado para gerenciar links e dados relacionados
 * Gerencia estado e operações CRUD (Create, Read, Update, Delete, Reorder)
 */
export const useLinks = () => {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [variables, setVariables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Busca todos os dados da API (links, categorias, tags, variáveis)
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const [linksRes, categoriesRes, tagsRes, variablesRes] = await Promise.all([
        linksAPI.getAll(),
        categoriesAPI.getAll(),
        tagsAPI.getAll(),
        variablesAPI.getAll()
      ]);

      setLinks(linksRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setTags(tagsRes.data.data || []);

      // Transformar variáveis em objeto { CHAVE: valor } para acesso rápido
      const varsObj = {};
      (variablesRes.data.data || []).forEach(v => {
        varsObj[v.chave] = v.valor;
      });
      setVariables(varsObj);

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da API');
      setLoading(false);
    }
  }, []);

  /**
   * Carrega dados automaticamente ao montar o componente
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Cria um novo link
   * @param {Object} linkData - Dados do link a ser criado
   * @returns {Promise<Object>} Link criado
   */
  const createLink = useCallback(async (linkData) => {
    try {
      const response = await linksAPI.create(linkData);
      const newLink = response.data.data;

      // Adiciona o novo link ao estado
      setLinks(prevLinks => [...prevLinks, newLink]);

      return newLink;
    } catch (err) {
      console.error('Erro ao criar link:', err);
      throw err;
    }
  }, []);

  /**
   * Atualiza um link existente
   * @param {String} id - ID do link a ser atualizado
   * @param {Object} linkData - Novos dados do link
   * @returns {Promise<Object>} Link atualizado
   */
  const updateLink = useCallback(async (id, linkData) => {
    try {
      const response = await linksAPI.update(id, linkData);
      const updatedLink = response.data.data;

      // Atualiza o link no estado
      setLinks(prevLinks =>
        prevLinks.map(link => link._id === id ? updatedLink : link)
      );

      return updatedLink;
    } catch (err) {
      console.error('Erro ao atualizar link:', err);
      throw err;
    }
  }, []);

  /**
   * Deleta um link
   * @param {String} id - ID do link a ser deletado
   * @returns {Promise<void>}
   */
  const deleteLink = useCallback(async (id) => {
    try {
      await linksAPI.delete(id);

      // Remove o link do estado
      setLinks(prevLinks => prevLinks.filter(link => link._id !== id));
    } catch (err) {
      console.error('Erro ao deletar link:', err);
      throw err;
    }
  }, []);

  /**
   * Reordena os links (drag and drop)
   * @param {Array} reorderedLinks - Array com nova ordem dos links
   * @returns {Promise<void>}
   */
  const reorderLinks = useCallback(async (reorderedLinks) => {
    try {
      // Atualiza estado otimisticamente
      setLinks(reorderedLinks);

      // Envia nova ordem para o backend
      const orderedIds = reorderedLinks.map((link, index) => ({
        id: link._id,
        ordem: index + 1
      }));

      await linksAPI.reorder({ links: orderedIds });
    } catch (err) {
      console.error('Erro ao reordenar links:', err);
      // Reverte mudanças em caso de erro
      fetchData();
      throw err;
    }
  }, [fetchData]);

  /**
   * Recarrega todos os dados (útil após erros ou para atualizar)
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Recarrega apenas as tags (mais eficiente quando só tags mudaram)
   */
  const refreshTags = useCallback(async () => {
    try {
      const tagsRes = await tagsAPI.getAll();
      setTags(tagsRes.data.data || []);
    } catch (err) {
      console.error('Erro ao recarregar tags:', err);
    }
  }, []);

  return {
    // Dados
    links,
    categories,
    tags,
    variables,

    // Estados
    loading,
    error,

    // Funções CRUD
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    refetch,
    refreshTags
  };
};

export default useLinks;
