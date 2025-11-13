import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tagsAPI } from '../../services/api';

/**
 * Schema de validação com Zod
 * Sincronizado com validações do backend (Mongoose)
 */
const linkSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  endereco: z.string()
    .min(1, 'URL é obrigatória'),
  categoria: z.string()
    .min(1, 'Categoria é obrigatória'),
  observacoes: z.string().optional(),
  descricao: z.string().optional(),
  icone: z.string().optional(),
  cor: z.string()
    .optional()
    .refine((val) => !val || /^#[0-9A-Fa-f]{6}$/.test(val), {
      message: 'Cor deve estar no formato hexadecimal (#RRGGBB)'
    }),
  credenciais: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ativo: z.boolean().optional()
});

/**
 * Modal para criar/editar links
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de abertura do modal
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {Function} props.onSave - Função chamada ao salvar (recebe os dados do formulário)
 * @param {Array} props.categories - Lista de categorias disponíveis
 * @param {Array} props.tags - Lista de tags disponíveis
 * @param {Array} props.variables - Lista de variáveis disponíveis (SERVER_IP, NOTE_IP)
 * @param {Object} props.initialData - Dados iniciais para edição (opcional)
 */
const LinkModal = ({ isOpen, onClose, onSave, categories = [], tags = [], variables = [], initialData = null, onTagsUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState(initialData?.tags?.map(t => t._id) || []);
  const [urlType, setUrlType] = useState('EXTERNA'); // EXTERNA, SERVER_IP, NOTE_IP
  const [showTagManager, setShowTagManager] = useState(false);

  // Estados para gerenciamento de tags
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [isTagActionLoading, setIsTagActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      categoria: '',
      observacoes: '',
      descricao: '',
      icone: '🔗',
      cor: '#3B82F6',
      credenciais: '',
      ativo: true
    }
  });

  /**
   * Atualiza o formulário quando initialData mudar (modo EDIT)
   */
  useEffect(() => {
    if (initialData) {
      // Detectar tipo de URL
      let tipo = 'EXTERNA';
      let urlParaEdicao = initialData.endereco || '';

      if (urlParaEdicao.includes('{{SERVER_IP}}')) {
        tipo = 'SERVER_IP';
        // Extrair só a porta (remove {{SERVER_IP}}:)
        urlParaEdicao = urlParaEdicao.replace('{{SERVER_IP}}:', '').replace('{{SERVER_IP}}', '');
      } else if (urlParaEdicao.includes('{{NOTE_IP}}')) {
        tipo = 'NOTE_IP';
        // Extrair só a porta (remove {{NOTE_IP}}:)
        urlParaEdicao = urlParaEdicao.replace('{{NOTE_IP}}:', '').replace('{{NOTE_IP}}', '');
      }

      setUrlType(tipo);

      // Pré-preencher formulário com dados existentes
      reset({
        nome: initialData.nome || '',
        endereco: urlParaEdicao,
        categoria: initialData.categoria?._id || initialData.categoria || '',
        observacoes: initialData.observacoes || '',
        descricao: initialData.descricao || '',
        icone: initialData.icone || '🔗',
        cor: initialData.cor || '#3B82F6',
        credenciais: initialData.credenciais || '',
        ativo: initialData.ativo ?? true
      });

      // Pré-selecionar tags
      const tagIds = initialData.tags?.map(t => typeof t === 'string' ? t : t._id) || [];
      setSelectedTags(tagIds);
    } else {
      // Resetar para valores padrão (modo CREATE)
      setUrlType('EXTERNA');
      reset({
        nome: '',
        endereco: '',
        categoria: '',
        observacoes: '',
        descricao: '',
        icone: '🔗',
        cor: '#3B82F6',
        credenciais: '',
        ativo: true
      });
      setSelectedTags([]);
    }
  }, [initialData, reset]);

  /**
   * Fecha o modal e reseta o formulário
   */
  const handleClose = () => {
    reset({
      nome: '',
      endereco: '',
      categoria: '',
      observacoes: '',
      descricao: '',
      icone: '🔗',
      cor: '#3B82F6',
      credenciais: '',
      ativo: true
    });
    setSelectedTags([]);
    onClose();
  };

  /**
   * Submete o formulário
   */
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Montar URL final baseado no tipo selecionado
      let urlFinal = data.endereco;

      if (urlType === 'SERVER_IP') {
        urlFinal = `{{SERVER_IP}}:${data.endereco}`;
      } else if (urlType === 'NOTE_IP') {
        urlFinal = `{{NOTE_IP}}:${data.endereco}`;
      }

      // Adiciona as tags selecionadas e URL final aos dados
      const linkData = {
        ...data,
        endereco: urlFinal,
        tags: selectedTags
      };

      await onSave(linkData);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      alert('Erro ao salvar link. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Gerencia seleção de tags
   */
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  /**
   * Adiciona uma nova tag
   */
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsTagActionLoading(true);
      await tagsAPI.create({ nome: newTagName.trim() });
      setNewTagName('');
      // Atualizar lista de tags no componente pai
      if (onTagsUpdated) {
        await onTagsUpdated();
      }
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
      alert('Erro ao adicionar tag. Tente novamente.');
    } finally {
      setIsTagActionLoading(false);
    }
  };

  /**
   * Inicia edição de uma tag
   */
  const handleStartEditTag = (tag) => {
    setEditingTagId(tag._id);
    setEditingTagName(tag.nome);
  };

  /**
   * Salva edição de uma tag
   */
  const handleSaveEditTag = async () => {
    if (!editingTagName.trim() || !editingTagId) return;

    try {
      setIsTagActionLoading(true);
      await tagsAPI.update(editingTagId, { nome: editingTagName.trim() });
      setEditingTagId(null);
      setEditingTagName('');
      // Atualizar lista de tags no componente pai
      if (onTagsUpdated) {
        await onTagsUpdated();
      }
    } catch (error) {
      console.error('Erro ao editar tag:', error);
      alert('Erro ao editar tag. Tente novamente.');
    } finally {
      setIsTagActionLoading(false);
    }
  };

  /**
   * Cancela edição de uma tag
   */
  const handleCancelEditTag = () => {
    setEditingTagId(null);
    setEditingTagName('');
  };

  /**
   * Deleta uma tag
   */
  const handleDeleteTag = async (tagId) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      setIsTagActionLoading(true);
      await tagsAPI.delete(tagId);
      // Remover tag dos selecionados se estava selecionada
      setSelectedTags(prev => prev.filter(id => id !== tagId));
      // Atualizar lista de tags no componente pai
      if (onTagsUpdated) {
        await onTagsUpdated();
      }
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
      alert('Erro ao deletar tag. Tente novamente.');
    } finally {
      setIsTagActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b-2 border-blue-200 dark:border-gray-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-indigo-100">
              {initialData ? 'Editar Link' : 'Novo Link'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              Nome *
            </label>
            <input
              id="nome"
              type="text"
              {...register('nome')}
              className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Nome do serviço"
            />
            {errors.nome && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          {/* URL com Select de Variáveis */}
          <div>
            <label htmlFor="endereco" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              URL *
            </label>
            <div className="flex gap-3">
              <select
                value={urlType}
                onChange={(e) => setUrlType(e.target.value)}
                className="px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                           focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 cursor-pointer
                           min-w-[140px]"
              >
                <option value="EXTERNA">Externa</option>
                <option value="SERVER_IP">Server IP</option>
                <option value="NOTE_IP">Note IP</option>
              </select>
              <input
                id="endereco"
                type="text"
                {...register('endereco')}
                className="flex-1 px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                           focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder={
                  urlType === 'EXTERNA'
                    ? 'https://exemplo.com'
                    : '8080'
                }
              />
            </div>
            {errors.endereco && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.endereco.message}</p>
            )}
            {urlType !== 'EXTERNA' && (
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Digite apenas a porta (ex: 8080). A URL será: {urlType === 'SERVER_IP' ? '{{SERVER_IP}}' : '{{NOTE_IP}}'}: porta
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              Categoria *
            </label>
            <select
              id="categoria"
              {...register('categoria')}
              className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 cursor-pointer"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.categoria.message}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              {...register('observacoes')}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
              placeholder="Observações sobre o serviço..."
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              {...register('descricao')}
              rows={2}
              className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
              placeholder="Descrição breve do serviço..."
            />
          </div>

          {/* Ícone e Cor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="icone" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
                Ícone (emoji)
              </label>
              <input
                id="icone"
                type="text"
                {...register('icone')}
                maxLength={2}
                className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100 text-center text-2xl
                           focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="🔗"
              />
            </div>

            <div>
              <label htmlFor="cor" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
                Cor
              </label>
              <input
                id="cor"
                type="color"
                {...register('cor')}
                className="w-full h-[44px] border-2 border-blue-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-slate-700 cursor-pointer
                           focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* Credenciais */}
          <div>
            <label htmlFor="credenciais" className="block text-sm font-semibold text-gray-700 dark:text-indigo-200 mb-2">
              Credenciais (formato: user:pass)
            </label>
            <input
              id="credenciais"
              type="text"
              {...register('credenciais')}
              className="w-full px-4 py-2.5 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="usuario:senha"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ⚠️ As credenciais são armazenadas em texto plano
            </p>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-indigo-200">
                Tags
              </label>
              <button
                type="button"
                onClick={() => setShowTagManager(!showTagManager)}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400
                           transition-colors duration-200 p-1 rounded"
                title="Gerenciar tags"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 border-2 border-blue-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-slate-700 max-h-[150px] overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma tag disponível</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleTagToggle(tag._id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                               ${selectedTags.includes(tag._id)
                                 ? 'bg-blue-500 text-white'
                                 : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                               }`}
                  >
                    {tag.nome}
                  </button>
                ))
              )}
            </div>

            {/* Painel de Gerenciamento de Tags */}
            {showTagManager && (
              <div className="mt-3 p-4 border-2 border-blue-200 dark:border-gray-600 rounded-lg
                             bg-blue-50 dark:bg-slate-700/50 space-y-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-indigo-200">
                  Gerenciar Tags
                </div>

                {/* Form: Adicionar Nova Tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Nova tag..."
                    disabled={isTagActionLoading}
                    className="flex-1 px-3 py-2 text-sm border-2 border-blue-300 dark:border-gray-500 rounded-lg
                               bg-white dark:bg-slate-600 text-gray-900 dark:text-indigo-100
                               focus:outline-none focus:border-blue-500 dark:focus:border-blue-400
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={isTagActionLoading || !newTagName.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium
                               rounded-lg transition-colors duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTagActionLoading ? '...' : 'Adicionar'}
                  </button>
                </div>

                {/* Lista de Tags Existentes */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                      Nenhuma tag cadastrada
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <div
                        key={tag._id}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-slate-600 rounded-lg
                                   border border-blue-200 dark:border-gray-500"
                      >
                        {/* Modo de Edição */}
                        {editingTagId === tag._id ? (
                          <>
                            <input
                              type="text"
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditTag();
                                }
                                if (e.key === 'Escape') {
                                  handleCancelEditTag();
                                }
                              }}
                              disabled={isTagActionLoading}
                              className="flex-1 px-2 py-1 text-sm border border-blue-400 dark:border-blue-500 rounded
                                         bg-white dark:bg-slate-700 text-gray-900 dark:text-indigo-100
                                         focus:outline-none focus:ring-2 focus:ring-blue-400
                                         disabled:opacity-50"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditTag}
                              disabled={isTagActionLoading || !editingTagName.trim()}
                              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30
                                         rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Salvar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditTag}
                              disabled={isTagActionLoading}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                                         rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancelar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Modo de Visualização */}
                            <span className="flex-1 text-sm text-gray-700 dark:text-indigo-100">
                              {tag.nome}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditTag(tag)}
                              disabled={isTagActionLoading}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30
                                         rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTag(tag._id)}
                              disabled={isTagActionLoading}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30
                                         rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Excluir"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Dica de atalhos */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 Dica: Pressione Enter para salvar, Esc para cancelar
                </p>
              </div>
            )}
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-3">
            <input
              id="ativo"
              type="checkbox"
              {...register('ativo')}
              defaultChecked={initialData?.ativo ?? true}
              className="w-5 h-5 text-blue-600 border-2 border-blue-300 dark:border-gray-600 rounded
                         focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="ativo" className="text-sm font-semibold text-gray-700 dark:text-indigo-200 cursor-pointer">
              Link ativo
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-blue-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-700 dark:text-gray-200 font-semibold
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold
                         rounded-lg shadow-md transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkModal;
