// src/contexts/AuthContext.tsx - VERSÃO COMPLETA COM getAuthToken

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AuthService from '../api/authService';

interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
  equipe?: number; // ID da equipe, pode ser null
  // Dados adicionais que podem vir da API
  data_cadastro?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // ✅ MÉTODO OBRIGATÓRIO para o useRanking funcionar
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => { },
  logout: () => { },
  refreshUser: async () => { },
  getAuthToken: () => null, // ✅ ADICIONADO
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FUNÇÃO OBRIGATÓRIA: Retorna o token de autenticação
  const getAuthToken = (): string | null => {
    try {
      // Tenta obter o token do localStorage primeiro
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');

      if (token) {
        console.log('🔑 Token encontrado no localStorage');
        return token;
      }

      // Se não encontrar no localStorage, tenta do AuthService
      if (AuthService.isAuthenticated && AuthService.isAuthenticated()) {
        // Alguns AuthServices podem ter um método para obter o token atual
        if (typeof (AuthService as any).getToken === 'function') {
          const serviceToken = (AuthService as any).getToken();
          console.log('🔑 Token obtido do AuthService');
          return serviceToken;
        }
      }

      console.warn('⚠️ Token não encontrado');
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  };

  // Carrega o usuário quando o componente é montado
  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          console.log('🔄 Carregando usuário autenticado...');
          await refreshUser();
          console.log('✅ Usuário carregado com sucesso');
        } catch (error) {
          console.error("❌ Erro ao carregar usuário:", error);
          // Se houver erro, limpa os tokens
          AuthService.logout();
        }
      } else {
        console.log('🚫 Usuário não está autenticado');
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const refreshUser = async () => {
    try {
      console.log('🔄 Atualizando dados do usuário...');
      const response = await AuthService.getProfile();

      // Log dos dados do usuário para debug
      console.log('👤 Dados do usuário:', {
        id: response.data.id,
        username: response.data.username,
        nickname: response.data.nickname,
        equipe: response.data.equipe
      });

      setUser(response.data);
    } catch (error) {
      console.error("❌ Erro ao obter perfil do usuário:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Fazendo login para:', username);

      // Faz o login através do AuthService
      await AuthService.login({ username, password });
      console.log('✅ Login realizado com sucesso');

      // Carrega os dados do usuário
      await refreshUser();
      console.log('✅ Dados do usuário carregados após login');

    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('👋 Fazendo logout...');

      // Limpa os dados do AuthService
      AuthService.logout();

      // Limpa o estado do usuário
      setUser(null);

      // Limpa tokens adicionais do localStorage (se houver)
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  // ✅ VALOR DO CONTEXTO COM TODAS AS FUNÇÕES NECESSÁRIAS
  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    getAuthToken, // ✅ OBRIGATÓRIO para o useRanking
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// ✅ HOOK AUXILIAR: Para facilitar o acesso ao token em outros lugares
export const useAuthToken = (): string | null => {
  const { getAuthToken } = useAuth();
  return getAuthToken();
};

// ✅ HOOK AUXILIAR: Para verificar se o usuário tem equipe
export const useUserTeam = (): { hasTeam: boolean; teamId: number | null } => {
  const { user } = useAuth();
  return {
    hasTeam: !!user?.equipe,
    teamId: user?.equipe || null
  };
};