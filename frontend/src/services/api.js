import axios from 'axios';

// URL base da API (pegando do .env ou usando default)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.2.138:30001/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de request (pode adicionar tokens, etc)
api.interceptors.request.use(
  (config) => {
    // Você pode adicionar tokens de autenticação aqui no futuro
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response (tratamento de erros global)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros global
    if (error.response) {
      // Erro da API (status 4xx ou 5xx)
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Erro de rede (sem resposta)
      console.error('Network Error:', error.request);
    } else {
      // Outro erro
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// LINKS
// ============================================
export const linksAPI = {
  // Listar todos os links (com filtros opcionais)
  getAll: (params = {}) => api.get('/links', { params }),

  // Buscar link por ID
  getById: (id) => api.get(`/links/${id}`),

  // Criar novo link
  create: (data) => api.post('/links', data),

  // Atualizar link
  update: (id, data) => api.put(`/links/${id}`, data),

  // Deletar link
  delete: (id) => api.delete(`/links/${id}`),

  // Reordenar links
  reorder: (data) => api.patch('/links/reorder', data),
};

// ============================================
// CATEGORIAS
// ============================================
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============================================
// TAGS
// ============================================
export const tagsAPI = {
  getAll: (params = {}) => api.get('/tags', { params }),
  getById: (id) => api.get(`/tags/${id}`),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
};

// ============================================
// VARIÁVEIS
// ============================================
export const variablesAPI = {
  getAll: () => api.get('/variables'),
  getByKey: (chave) => api.get(`/variables/${chave}`),
  create: (data) => api.post('/variables', data),
  update: (chave, data) => api.put(`/variables/${chave}`, data),
  delete: (chave) => api.delete(`/variables/${chave}`),
};

export default api;
