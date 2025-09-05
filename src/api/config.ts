// src/api/config.ts - Configuração centralizada da API (TIPOS CORRIGIDOS)

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuração base da API
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Criar instância do axios com configurações padrão
const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR DE REQUEST: Adiciona token automaticamente (TIPOS CORRIGIDOS)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Buscar token do localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Garantir que headers existe
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token adicionado à requisição:', config.url);
    }

    // Log da requisição para debug
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data ? config.data : '');

    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE: Trata respostas e erros globalmente
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta para debug
    console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Log detalhado do erro
    if (error.response) {
      // Erro HTTP (4xx, 5xx)
      console.error(`❌ ${error.response.status} ${error.config?.url}:`, error.response.data);

      // Tratar erro 401 (não autorizado) globalmente
      if (error.response.status === 401) {
        console.warn('🚫 Token expirado ou inválido, redirecionando para login...');

        // Limpar tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Redirecionar para login (se estiver no browser)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Tratar erro 403 (acesso negado)
      if (error.response.status === 403) {
        console.warn('🚫 Acesso negado para:', error.config?.url);
      }

      // Tratar erro 404 (não encontrado)
      if (error.response.status === 404) {
        console.warn('🔍 Recurso não encontrado:', error.config?.url);
      }

      // Tratar erros de servidor (5xx)
      if (error.response.status >= 500) {
        console.error('🔥 Erro interno do servidor:', error.response.status);
      }

    } else if (error.request) {
      // Erro de rede (sem resposta)
      console.error('🌐 Erro de rede ou timeout:', error.message);
    } else {
      // Erro de configuração
      console.error('⚙️ Erro de configuração:', error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ FUNÇÃO AUXILIAR: Para fazer requisições com retry automático
export const apiWithRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse<T>> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // Não tentar novamente em erros 4xx (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Se não for a última tentativa, aguarda e tenta novamente
      if (attempt < maxRetries) {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }
  }

  throw lastError;
};

// ✅ FUNÇÃO AUXILIAR: Para verificar se a API está online
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health/', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('❌ API não está respondendo:', error);
    return false;
  }
};

// ✅ FUNÇÃO AUXILIAR: Para obter informações da API
export const getApiInfo = () => {
  return {
    baseURL,
    timeout: api.defaults.timeout,
    hasToken: !!(localStorage.getItem('authToken') || localStorage.getItem('access_token'))
  };
};

export default api;