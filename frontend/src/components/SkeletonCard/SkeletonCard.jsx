/**
 * Skeleton loader para LinkCard
 * Exibido durante o carregamento dos dados
 */
const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-md
                   border border-blue-200 dark:border-gray-700
                   flex flex-col animate-pulse">
      {/* Topo: Ícone + Título + Categoria */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Ícone skeleton */}
          <div className="w-8 h-8 rounded-md bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>

          {/* Título skeleton */}
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 max-w-[60%]"></div>
        </div>

        {/* Categoria skeleton */}
        <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>

      {/* URL skeleton */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-4/5"></div>

      {/* Observações skeleton (2 linhas) */}
      <div className="space-y-2 mb-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-1.5 mt-2">
        <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-5 w-14 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
