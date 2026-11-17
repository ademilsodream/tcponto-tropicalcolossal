
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { Clock } from 'lucide-react';
import { shouldShowAuthSplash } from '@/utils/authSessionEvents';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, isLoading, hasAccess } = useOptimizedAuth();

  // ✨ Loading state - aguardando verificação completa
  // (só no arranque: num refresh em segundo plano os children continuam montados)
  if (shouldShowAuthSplash(isLoading, !!profile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-primary-600">Verificando autenticação e permissões...</p>
        </div>
      </div>
    );
  }

  // ✨ Se não há usuário logado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✨ Se usuário logado mas sem perfil carregado ainda, aguardar
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-primary-600">Carregando perfil do usuário...</p>
        </div>
      </div>
    );
  }

  // ✨ Se usuário perdeu acesso durante o uso, redirecionar para login
  // O AuthContext já vai fazer logout automático, mas garantimos o redirect
  if (!hasAccess) {
    console.log('🔒 ProtectedRoute: Usuário sem acesso, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // ✨ Se passou por todas as verificações, permitir acesso ao app
  return <>{children}</>;
};

export default ProtectedRoute;
