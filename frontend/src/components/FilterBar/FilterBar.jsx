import { useState, useEffect } from 'react';

const FilterBar = ({
  categories = [],
  tags = [],
  onCategoryChange,
  onTagsChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState(['all']);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (onCategoryChange) {
      onCategoryChange(value);
    }
  };

  const handleTagsChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);

    // Se selecionar "Todas", desmarcar outras
    if (options.includes('all') && !selectedTags.includes('all')) {
      setSelectedTags(['all']);
      if (onTagsChange) {
        onTagsChange(['all']);
      }
      return;
    }

    // Se selecionar outra tag, remover "Todas"
    const filtered = options.filter(opt => opt !== 'all');
    const newSelection = filtered.length > 0 ? filtered : ['all'];

    setSelectedTags(newSelection);
    if (onTagsChange) {
      onTagsChange(newSelection);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto mb-8">
      <div className="flex gap-4 items-end flex-wrap">
        {/* Select de Categoria */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label
            htmlFor="categorySelect"
            className="text-xs font-semibold text-gray-700 dark:text-indigo-200 pl-1.5"
          >
            Categoria:
          </label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2.5 text-base border-2 border-blue-300 dark:border-gray-600
                       rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-indigo-100
                       shadow-md cursor-pointer outline-none transition-all duration-300
                       hover:border-blue-400 dark:hover:border-blue-500
                       hover:shadow-lg
                       focus:border-blue-400 dark:focus:border-blue-500
                       focus:shadow-lg focus:-translate-y-0.5"
          >
            <option value="all">Todos</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.nome} value={cat._id || cat.nome}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Campo de Busca */}
        <div className="flex-1 min-w-[280px]">
          {/* Este espaço será preenchido pelo SearchBar no componente pai */}
        </div>

        {/* Select de Tags */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label
            htmlFor="tagsSelect"
            className="text-xs font-semibold text-gray-700 dark:text-indigo-200 pl-1.5"
          >
            Tags:
          </label>
          <select
            id="tagsSelect"
            multiple
            value={selectedTags}
            onChange={handleTagsChange}
            className="px-4 py-2.5 text-base border-2 border-blue-300 dark:border-gray-600
                       rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-indigo-100
                       shadow-md cursor-pointer outline-none transition-all duration-300
                       hover:border-blue-400 dark:hover:border-blue-500
                       hover:shadow-lg
                       focus:border-blue-400 dark:focus:border-blue-500
                       focus:shadow-lg focus:-translate-y-0.5
                       min-h-[44px] max-h-[150px] overflow-y-auto"
            style={{
              backgroundImage: 'none' // Remove a seta padrão do select multiple
            }}
          >
            <option value="all" className="p-2 my-0.5 rounded">
              Todas
            </option>
            {tags.map((tag) => (
              <option
                key={tag._id || tag.nome}
                value={tag._id || tag.nome}
                className="p-2 my-0.5 rounded"
              >
                {tag.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
