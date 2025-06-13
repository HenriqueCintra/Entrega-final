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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => { },
  logout: () => { },
  refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega o usuário quando o componente é montado
  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          // Se houver erro, limpa os tokens
          AuthService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await AuthService.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao obter perfil do usuário:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    await AuthService.login({ username, password });
    await refreshUser();
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;