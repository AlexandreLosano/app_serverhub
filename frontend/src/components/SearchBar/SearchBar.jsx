import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Buscar serviços...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce da busca (300ms após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-[5px]">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 text-base border-2 rounded-full outline-none transition-all duration-300
                   focus:-translate-y-0.5"
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
      />
    </div>
  );
};

export default SearchBar;
