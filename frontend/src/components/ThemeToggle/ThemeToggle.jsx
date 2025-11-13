import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    // Ciclar entre light -> dark -> auto
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  // Ícone baseado no tema atual
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '🌓';
    }
  };

  // Tooltip com descrição do tema
  const getTitle = () => {
    switch (theme) {
      case 'light':
        return 'Modo Claro (clique para Escuro)';
      case 'dark':
        return 'Modo Escuro (clique para Auto)';
      case 'auto':
        return 'Modo Auto (clique para Claro)';
      default:
        return 'Alternar tema';
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={getTitle()}
      className="px-3 py-2 text-xl bg-gray-100 dark:bg-gray-700 border-2 border-blue-200 dark:border-gray-600
                 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600
                 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
