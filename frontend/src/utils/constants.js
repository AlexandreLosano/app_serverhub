// ============================================
// CONSTANTES DO SERVIDOR HUB
// ============================================

// Categorias padrão
export const DEFAULT_CATEGORIES = [
  { nome: 'Server', icone: '🖥️', cor: '#3b82f6' },
  { nome: 'Note', icone: '💻', cor: '#8b5cf6' },
  { nome: 'Externo', icone: '🌐', cor: '#10b981' },
];

// Tags padrão
export const DEFAULT_TAGS = [
  'database',
  'admin',
  'monitoring',
  'docker',
  'api',
  'media',
  'automation',
  'storage',
];

// Cores disponíveis para cards
export const CARD_COLORS = [
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Indigo', valor: '#6366f1' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Amarelo', valor: '#eab308' },
  { nome: 'Verde', valor: '#22c55e' },
  { nome: 'Teal', valor: '#14b8a6' },
  { nome: 'Cyan', valor: '#06b6d4' },
  { nome: 'Cinza', valor: '#64748b' },
];

// Ícones sugeridos para links
export const SUGGESTED_ICONS = [
  '🖥️', '💻', '🌐', '🔗', '📊', '📈', '📉', '🗄️',
  '🐳', '🐘', '🍃', '📕', '📋', '⚙️', '🔧', '🛠️',
  '🌊', '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲',
  '🔐', '🔒', '🔓', '🔑', '🛡️', '⚡', '🔥', '💡',
  '📦', '📁', '📂', '📝', '📄', '📃', '📑', '📇',
];

// Temas disponíveis
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Configurações de grid responsivo
export const GRID_CONFIG = {
  sm: 1, // Mobile
  md: 2, // Tablet
  lg: 3, // Desktop pequeno
  xl: 4, // Desktop médio
  '2xl': 5, // Desktop grande
};

// Tempo de debounce para busca (ms)
export const SEARCH_DEBOUNCE_TIME = 300;

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_URL: 'URL inválida. Use http:// ou https://',
  MIN_LENGTH: (min) => `Mínimo de ${min} caracteres`,
  MAX_LENGTH: (max) => `Máximo de ${max} caracteres`,
};

// Regex para validação de URL
export const URL_REGEX = /^https?:\/\/.+/;

// Regex para detectar variáveis no formato {{VARIAVEL}}
export const VARIABLE_REGEX = /\{\{([A-Z_]+)\}\}/g;

// Substituir variáveis na URL
export const replaceVariables = (text, variables = {}) => {
  if (!text) return text;

  return text.replace(VARIABLE_REGEX, (match, varName) => {
    return variables[varName] || match;
  });
};

// Copiar para clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar:', error);
    return false;
  }
};

// Formatar data
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Gerar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
