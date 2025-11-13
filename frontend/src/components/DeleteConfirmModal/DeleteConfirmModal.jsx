/**
 * Modal de confirmação para deletar link
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de abertura do modal
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {Function} props.onConfirm - Função chamada ao confirmar a exclusão
 * @param {Object} props.link - Dados do link a ser deletado
 * @param {boolean} props.isDeleting - Estado de carregamento da exclusão
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, link, isDeleting = false }) => {
  if (!isOpen || !link) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b-2 border-red-200 dark:border-red-800 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100">
              Confirmar Exclusão
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Tem certeza que deseja deletar o link:
          </p>

          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* Ícone do link */}
              {link.icone && (
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: link.cor || '#64748b' }}
                >
                  {link.icone}
                </div>
              )}

              {/* Nome e URL */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-indigo-100 truncate">
                  {link.nome}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.endereco}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ Esta ação não pode ser desfeita!
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                     text-gray-700 dark:text-gray-200 font-semibold
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold
                     rounded-lg shadow-md transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
