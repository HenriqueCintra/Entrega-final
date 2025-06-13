import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Se ainda estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-300 to-purple-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="[font-family:'Silkscreen',Helvetica] text-black text-lg">CARREGANDO...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se estiver autenticado, renderiza os componentes filhos
  return <>{children}</>;
};

export default ProtectedRoute;