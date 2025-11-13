import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import LinkCard from './components/LinkCard/LinkCard';
import SkeletonCard from './components/SkeletonCard/SkeletonCard';
import LinkModal from './components/LinkModal/LinkModal';
import DeleteConfirmModal from './components/DeleteConfirmModal/DeleteConfirmModal';
import { useLinks } from './hooks/useLinks';
import { useFilters } from './hooks/useFilters';

function App() {
  // Hook customizado para gerenciar links e dados da API
  const { links, categories, tags, variables, loading, error, createLink, updateLink, deleteLink, reorderLinks, refreshTags } = useLinks();

  // Estado dos modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLink, setDeletingLink] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para drag-and-drop
  const [activeId, setActiveId] = useState(null);

  // Sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Hook customizado para gerenciar filtros
  const {
    filteredLinks,
    searchTerm,
    selectedCategory,
    selectedTags,
    setSearchTerm,
    setSelectedCategory,
    setSelectedTags
  } = useFilters(links);

  /**
   * Manipula a criação de um novo link
   */
  const handleCreateLink = async (linkData) => {
    try {
      await createLink(linkData);
      toast.success('Link criado com sucesso!', {
        duration: 3000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Erro ao criar link:', error);
      toast.error('Erro ao criar link. Tente novamente.', {
        duration: 4000,
        position: 'top-right'
      });
      throw error; // Propaga o erro para o modal tratar
    }
  };

  /**
   * Abre o modal de edição com os dados do link
   */
  const handleEdit = (link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  /**
   * Manipula a atualização de um link existente
   */
  const handleUpdateLink = async (linkData) => {
    try {
      await updateLink(editingLink._id, linkData);
      toast.success('Link atualizado com sucesso!', {
        duration: 3000,
        position: 'top-right'
      });
      setEditingLink(null); // Limpa o estado de edição
    } catch (error) {
      console.error('Erro ao atualizar link:', error);
      toast.error('Erro ao atualizar link. Tente novamente.', {
        duration: 4000,
        position: 'top-right'
      });
      throw error; // Propaga o erro para o modal tratar
    }
  };

  /**
   * Abre o modal de confirmação de exclusão
   */
  const handleDelete = (link) => {
    setDeletingLink(link);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirma e executa a exclusão do link
   */
  const handleConfirmDelete = async () => {
    if (!deletingLink) return;

    try {
      setIsDeleting(true);
      await deleteLink(deletingLink._id);
      toast.success('Link deletado com sucesso!', {
        duration: 3000,
        position: 'top-right'
      });
      setIsDeleteModalOpen(false);
      setDeletingLink(null);
    } catch (error) {
      console.error('Erro ao deletar link:', error);
      toast.error('Erro ao deletar link. Tente novamente.', {
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Fecha o modal de link e limpa o estado de edição
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  /**
   * Manipula o início do arrasto (drag-and-drop)
   */
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  /**
   * Manipula o fim do arrasto (drag-and-drop)
   */
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Encontra os índices dos links na lista original completa
    const oldIndex = links.findIndex((link) => link._id === active.id);
    const newIndex = links.findIndex((link) => link._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      return;
    }

    // Reordena todos os links (não apenas filteredLinks)
    const newOrder = arrayMove(links, oldIndex, newIndex);

    try {
      // Persiste no backend (reorderLinks do hook já faz o update otimista)
      await reorderLinks(newOrder);

      toast.success('Ordem atualizada!', {
        duration: 2000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Erro ao reordenar links:', error);
      toast.error('Erro ao salvar nova ordem. Tente novamente.', {
        duration: 3000,
        position: 'top-right'
      });
    }

    setActiveId(null);
  };

  return (
    <>
      {/* Toast notifications */}
      <Toaster
        toastOptions={{
          className: '',
          style: {
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="min-h-screen transition-colors duration-300" style={{ background: 'linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))' }}>
        <div className="max-w-[1600px] mx-auto p-5">
        {/* Header com relógio, botão adicionar e theme toggle */}
        <Header onAddLink={() => setIsModalOpen(true)} />

        {/* Filtros e Busca */}
        <div className="max-w-[1200px] mx-auto mb-8">
          <div className="flex gap-[15px] items-end flex-wrap">
            {/* Categoria */}
            <div className="flex flex-col gap-[5px] min-w-[180px]">
              <label
                htmlFor="categorySelect"
                className="text-[0.85rem] font-semibold pl-[5px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Categoria:
              </label>
              <select
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-[15px] py-2.5 text-[0.95rem] border-2 rounded-lg cursor-pointer outline-none
                           transition-all duration-300 focus:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                  boxShadow: '0 2px 8px var(--card-shadow)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus)';
                  e.target.style.boxShadow = '0 4px 12px var(--card-shadow-hover)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = '0 2px 8px var(--card-shadow)';
                }}
              >
                <option value="all">Todos</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca */}
            <SearchBar onSearch={setSearchTerm} placeholder="Buscar serviços..." />

            {/* Tags */}
            <div className="flex flex-col gap-[5px] min-w-[180px]">
              <label
                htmlFor="tagsSelect"
                className="text-[0.85rem] font-semibold pl-[5px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tags:
              </label>
              <select
                id="tagsSelect"
                multiple
                size="1"
                value={selectedTags}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, opt => opt.value);
                  if (options.includes('all') && !selectedTags.includes('all')) {
                    setSelectedTags(['all']);
                  } else {
                    const filtered = options.filter(opt => opt !== 'all');
                    setSelectedTags(filtered.length > 0 ? filtered : ['all']);
                  }
                }}
                className="px-[15px] py-2.5 text-[0.95rem] border-2 rounded-lg cursor-pointer outline-none
                           transition-all duration-300 focus:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                  boxShadow: '0 2px 8px var(--card-shadow)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus)';
                  e.target.style.boxShadow = '0 4px 12px var(--card-shadow-hover)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = '0 2px 8px var(--card-shadow)';
                }}
              >
                <option value="all">Todas</option>
                {tags.map((tag) => (
                  <option key={tag._id} value={tag._id}>
                    {tag.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Links */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[15px] mb-10">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-xl text-red-600 dark:text-red-400 py-20">
            {error}
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center text-xl text-gray-800 dark:text-indigo-100 py-20
                         bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed
                         border-blue-300 dark:border-gray-600">
            Nenhum link encontrado
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredLinks.map((link) => link._id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[15px] mb-10">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link._id}
                    link={link}
                    variables={variables}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>

            {/* DragOverlay - mostra o card seguindo o cursor durante drag */}
            <DragOverlay>
              {activeId ? (
                <LinkCard
                  link={links.find((link) => link._id === activeId)}
                  variables={variables}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-800 dark:text-indigo-100 py-5 text-sm opacity-85">
          <p className="mb-1">
            Clique no botão "Adicionar Link" para adicionar novos serviços
          </p>
          <p>Desenvolvido por Alexandre Losano | 2025</p>
        </footer>
      </div>

      {/* Modal de criação/edição */}
      <LinkModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingLink ? handleUpdateLink : handleCreateLink}
        categories={categories}
        tags={tags}
        variables={variables}
        initialData={editingLink}
        onTagsUpdated={refreshTags}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLink(null);
        }}
        onConfirm={handleConfirmDelete}
        link={deletingLink}
        isDeleting={isDeleting}
      />
      </div>
    </>
  );
}

export default App;
