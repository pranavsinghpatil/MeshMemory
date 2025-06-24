import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extend the User interface to make name required
interface AppUser extends User {
  name: string;
}

export interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper to safely cast User to AppUser
  const toAppUser = (user: User | null): AppUser | null => {
    if (!user) return null;
    return {
      ...user,
      name: user.name || user.full_name || user.email.split('@')[0],
    };
  };

  // Load user from token on initial load
  const loadUser = async () => {
    try {
      console.log('Loading user session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Error:', error);
      setUser(session?.user ?? null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Handle login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        const user = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        };
        setUser(user);
        navigate('/app/dashboard');
      }
      
      return { user: data?.user || null, error };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Handle registration
  const register = async (userData: { name: string; email: string; password: string; full_name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name || userData.name,
            name: userData.name,
          },
        },
      });

      if (error) throw error;
      
      if (data?.user) {
        const user = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        };
        setUser(user);
        navigate('/app/dashboard');
      }
      
      return { user: data?.user || null, error };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear the user state
      setUser(null);
      navigate('/login');
    }
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
