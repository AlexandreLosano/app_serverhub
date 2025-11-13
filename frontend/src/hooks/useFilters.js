import { useState, useMemo } from 'react';

/**
 * Hook customizado para gerenciar filtros de links
 * Aplica filtros de busca, categoria e tags
 */
export const useFilters = (links = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState(['all']);

  /**
   * Filtra os links baseado nos critérios selecionados
   * Usa useMemo para otimizar performance (só recalcula quando necessário)
   */
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Filtro de busca (nome, URL, observações)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchName = link.nome.toLowerCase().includes(search);
        const matchUrl = link.endereco.toLowerCase().includes(search);
        const matchObs = link.observacoes?.toLowerCase().includes(search);
        if (!matchName && !matchUrl && !matchObs) return false;
      }

      // Filtro de categoria
      if (selectedCategory !== 'all') {
        if (link.categoria?._id !== selectedCategory) return false;
      }

      // Filtro de tags
      if (!selectedTags.includes('all')) {
        const linkTagIds = link.tags.map(t => t._id);
        const hasTag = selectedTags.some(tagId => linkTagIds.includes(tagId));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [links, searchTerm, selectedCategory, selectedTags]);

  /**
   * Reseta todos os filtros para o estado inicial
   */
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags(['all']);
  };

  /**
   * Verifica se algum filtro está ativo
   */
  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    !selectedTags.includes('all');

  return {
    // Resultado filtrado
    filteredLinks,

    // Estados dos filtros
    searchTerm,
    selectedCategory,
    selectedTags,

    // Setters
    setSearchTerm,
    setSelectedCategory,
    setSelectedTags,

    // Utilidades
    resetFilters,
    hasActiveFilters
  };
};

export default useFilters;
