import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { replaceVariables } from '../../utils/constants';

const LinkCard = ({ link, variables = {}, onEdit, onDelete }) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Hook para tornar o card arrastável
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link._id });

  // Substituir variáveis na URL ({{SERVER_IP}}, etc)
  const processedUrl = replaceVariables(link.endereco, variables);

  // Estilo de transformação para drag-and-drop
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Cores de categoria baseadas no legacy
  const getCategoryColors = (categoryName) => {
    const colors = {
      'Externo': 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Server': 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Note': 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Local': 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Docker': 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Database': 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Workflow': 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };

    return colors[categoryName] || 'bg-gray-50 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const handleLinkClick = (e) => {
    // Abrir link em nova aba
    e.preventDefault();
    window.open(processedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 2px 6px var(--card-shadow)',
      }}
      {...attributes}
      className={`rounded-[10px] p-3 border flex flex-col relative animate-fadeInUp
                 transition-all duration-300 hover:-translate-y-[3px]
                 ${isDragging ? 'ring-4 ring-blue-500 shadow-2xl scale-105' : ''}`}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px var(--card-shadow-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 6px var(--card-shadow)'}
    >
      {/* Overlay durante drag */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl pointer-events-none z-10"></div>
      )}

      {/* Drag Handle (área para arrastar) */}
      <div
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1
                   hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors z-20"
        title="Arrastar para reordenar"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="4" cy="4" r="1"/>
          <circle cx="4" cy="8" r="1"/>
          <circle cx="4" cy="12" r="1"/>
          <circle cx="8" cy="4" r="1"/>
          <circle cx="8" cy="8" r="1"/>
          <circle cx="8" cy="12" r="1"/>
        </svg>
      </div>

      {/* Topo do Card: Ícone/Título + Categoria + Menu */}
      <div className="flex items-start justify-between gap-2 mb-2 ml-8">
        <a
          href={processedUrl}
          onClick={handleLinkClick}
          className="flex-1 min-w-0 no-underline"
        >
          <div className="flex items-center gap-2">
            {/* Ícone */}
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-[1.1rem] flex-shrink-0"
              style={{
                backgroundColor: link.cor || '#667eea'
              }}
            >
              {link.icone || '🔗'}
            </div>

            {/* Título */}
            <h3 className="text-[0.95rem] font-semibold leading-tight break-words" style={{ color: 'var(--text-primary)' }}>
              {link.nome}
            </h3>
          </div>
        </a>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Badge de Categoria */}
          {link.categoria && (
            <span
              className={`inline-block px-2 py-[3px] rounded-[10px] text-[0.65rem] font-semibold
                         whitespace-nowrap ${getCategoryColors(link.categoria.nome)}`}
            >
              {link.categoria.nome}
            </span>
          )}

          {/* Menu Dropdown (3 pontinhos) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                       transition-colors duration-200 focus:outline-none focus:ring-2
                       focus:ring-blue-500"
              title="Opções"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <circle cx="8" cy="3" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="8" cy="13" r="1.5"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800
                            rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                            z-10 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit?.(link);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200
                           hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors
                           flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete?.(link);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors
                           flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Deletar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <a
        href={processedUrl}
        onClick={handleLinkClick}
        className="no-underline block"
      >
        {/* URL */}
        <div className="text-[0.7rem] mb-1 break-all" style={{ color: 'var(--text-muted)' }}>
          {processedUrl}
        </div>

        {/* Observações */}
        {link.observacoes && (
          <div className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>
            {link.observacoes}
          </div>
        )}
      </a>

      {/* Tags */}
      {link.tags && link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {link.tags.map((tag) => (
            <span
              key={tag._id || tag.nome}
              className="inline-block px-2 py-[3px] rounded-lg text-[0.65rem]
                         font-medium whitespace-nowrap"
              style={{
                backgroundColor: 'var(--text-muted)',
                color: '#ffffff',
              }}
            >
              {tag.nome}
            </span>
          ))}
        </div>
      )}

      {/* Credenciais (se existirem) */}
      {link.credenciais && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Credenciais
            </span>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="bg-transparent border-none cursor-pointer p-1 text-base
                         transition-transform duration-200 hover:scale-115
                         active:scale-90 focus:outline-none"
              title={showCredentials ? 'Ocultar credenciais' : 'Mostrar credenciais'}
            >
              {showCredentials ? '🙈' : '👁️'}
            </button>
          </div>

          {showCredentials && (
            <div
              className="text-xs p-2 rounded-md font-mono border"
              style={{
                color: 'var(--text-primary)',
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              {link.credenciais.split('|').map((line, index) => (
                <div key={index}>{line.trim()}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkCard;
