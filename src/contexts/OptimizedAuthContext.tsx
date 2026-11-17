import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { isSilentSessionRefresh } from '@/utils/authSessionEvents';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useSessionManager } from '@/hooks/useSessionManager';
import { debugLog, isMobile, checkConnectivity } from '@/utils/debugLogger';
import { useAppDeviceTracking } from '@/hooks/useAppDeviceTracking';

interface Profile {
  id: string;
  name: string;
  email: string;
  hourly_rate: number;
  overtime_rate: number;
  employee_code?: string;
  status?: string;
  shift_id?: string;
  department_id?: string;
  job_function_id?: string;
  can_register_time: boolean;
  use_location_tracking: boolean;
  contratado?: boolean | null;
  departments?: { id: string; name: string };
  job_functions?: { id: string; name: string };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  hasAccess: boolean;
  sessionSettings: any;
  sessionWarning: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithRememberMe: (email: string, password: string, rememberMe: boolean) => Promise<{ error: any }>;
  renewSession: () => Promise<boolean>;
  dismissSessionWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const OptimizedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionWarningDismissed, setSessionWarningDismissed] = useState(false);

  const {
    sessionSettings,
    sessionWarning,
    sessionExpiry,
    createUserSession,
    updateSessionActivity,
    checkSessionExpiry,
    renewToken,
    cleanupExpiredSessions
  } = useSessionManager();

  const hasAccess = !!(profile && profile.can_register_time === true);

  useAppDeviceTracking(user?.id);

  const loadProfile = useCallback(async (userId: string, options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!userId) {
      debugLog('ERROR', 'Tentativa de carregar perfil sem userId');
      return;
    }

    debugLog('INFO', 'Carregando perfil para usuário', { userId, isMobile: isMobile() });

    const isConnected = await checkConnectivity();
    if (!isConnected) {
      debugLog('ERROR', 'Sem conectividade com o servidor');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          hourly_rate,
          overtime_rate,
          employee_code,
          status,
          shift_id,
          department_id,
          job_function_id,
          can_register_time,
          use_location_tracking,
          contratado,
          departments:department_id(id, name),
          job_functions:job_function_id(id, name)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        debugLog('ERROR', 'Erro ao carregar perfil', { error: error.message, code: error.code });
        // Em refresh silencioso um erro transitório não deve bloquear a UI
        if (!silent) setProfile(null);
        return;
      }

      if (data) {
        const profileWithLocationTracking: Profile = {
          ...data,
          use_location_tracking: (data as any).use_location_tracking ?? true,
        };
        debugLog('INFO', 'Perfil carregado com sucesso', {
          name: profileWithLocationTracking.name,
          status: profileWithLocationTracking.status,
          can_register_time: profileWithLocationTracking.can_register_time,
          use_location_tracking: profileWithLocationTracking.use_location_tracking,
        });
        setProfile(profileWithLocationTracking);
        await updateSessionActivity(userId);
      } else {
        debugLog('WARN', 'Nenhum perfil encontrado');
        setProfile(null);
      }
    } catch (error) {
      debugLog('ERROR', 'Erro inesperado ao carregar perfil', { error });
      if (!silent) setProfile(null);
    }
  }, [updateSessionActivity]);

  // Refs para o listener de auth ler o estado atual sem re-subscrever
  const userIdRef = useRef<string | null>(null);
  const hasProfileRef = useRef(false);
  const checkSessionExpiryRef = useRef(checkSessionExpiry);
  const loadProfileRef = useRef(loadProfile);
  userIdRef.current = user?.id ?? null;
  hasProfileRef.current = !!profile;
  checkSessionExpiryRef.current = checkSessionExpiry;
  loadProfileRef.current = loadProfile;

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        await supabase.from('user_sessions').delete().eq('user_id', user.id);
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  }, [user?.id]);

  const loginWithRememberMe = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    debugLog('INFO', 'Tentativa de login', { email, rememberMe, isMobile: isMobile() });

    try {
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        debugLog('ERROR', 'Sem conectividade para login');
        return { error: { message: 'Sem conectividade com o servidor' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) {
        await createUserSession(data.user, rememberMe);
        localStorage.setItem('tcponto_remember_me', rememberMe.toString());
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, [createUserSession]);

  const renewSession = useCallback(async () => {
    const success = await renewToken();
    if (success) setSessionWarningDismissed(false);
    return success;
  }, [renewToken]);

  const dismissSessionWarning = useCallback(() => setSessionWarningDismissed(true), []);

  useEffect(() => {
    let mounted = true;
    debugLog('INFO', 'Inicializando sistema de autenticação', { isMobile: isMobile() });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const newUser = session?.user ?? null;
      const silent = isSilentSessionRefresh(event, userIdRef.current, newUser?.id, hasProfileRef.current);

      // Mantém a mesma referência de user quando é o mesmo utilizador (evita recargas em cascata)
      setUser((prev) => (newUser && prev?.id === newUser.id ? prev : newUser));
      checkSessionExpiryRef.current(session);

      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null);
        setIsLoading(false);
        setSessionWarningDismissed(false);
      } else if (silent && newUser) {
        // App voltou do segundo plano (ex.: câmara): atualiza o perfil sem desmontar o ecrã atual
        setTimeout(() => {
          if (mounted) void loadProfileRef.current(newUser.id, { silent: true });
        }, 0);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newUser) {
        setIsLoading(true);
        setTimeout(() => {
          if (mounted) {
            loadProfileRef.current(newUser.id).finally(() => mounted && setIsLoading(false));
          }
        }, 0);
      }
    });

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setIsLoading(false);
          return;
        }
        if (session?.user && mounted) {
          setUser((prev) => (prev?.id === session.user.id ? prev : session.user));
          setIsLoading(true);
          checkSessionExpiryRef.current(session);
          loadProfileRef.current(session.user.id).finally(() => mounted && setIsLoading(false));
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    };

    initializeSession();
    return () => { mounted = false; subscription.unsubscribe(); };
    // Subscrição única: o estado atual é lido via refs
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => { checkSessionExpiry(session); });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, checkSessionExpiry]);

  const value = { user, profile, isLoading, hasAccess, sessionSettings, sessionWarning: sessionWarning && !sessionWarningDismissed, refreshProfile, logout, loginWithRememberMe, renewSession, dismissSessionWarning };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useOptimizedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useOptimizedAuth must be used within an OptimizedAuthProvider');
  return context;
};

export const useAuthPermissions = () => {
  const { profile } = useOptimizedAuth();
  return {
    canRegisterTime: profile?.can_register_time ?? false,
    hasProfile: !!profile,
    isActive: profile?.status === 'active',
    hasShift: !!profile?.shift_id,
    hasDepartment: !!profile?.department_id,
    useLocationTracking: profile?.use_location_tracking ?? true,
  };
};
