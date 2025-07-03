import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { sanitizeErrorMessage } from '@/services/api';

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

// Extend the User interface to make name required and add avatar
interface AppUser extends User {
  name: string;
  avatar?: string; // Add avatar property for use in components
}

export interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean; // Add isGuest property
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
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const navigate = useNavigate();

  // Helper to safely cast User to AppUser
  const toAppUser = (user: User | null): AppUser | null => {
    if (!user) return null;
    return {
      ...user,
      name: user.name || user.full_name || user.email.split('@')[0],
      avatar: user.avatar_url, // Map avatar_url to avatar for consistency
    };
  };

  // Load user from token on initial load
  const loadUser = async () => {
    try {
      console.log('Loading user session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Error:', error);
      
      if (session?.user) {
        // Map Supabase user to our User interface
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
        };
        setUser(toAppUser(userData));
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setIsLoading(false);
    }
  };

  // Load user on mount and set up auth state change listener
  useEffect(() => {
    loadUser();
    
    // Set up auth state change listener to keep session in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Use development logging
        if (import.meta.env.DEV) {
          console.log('Auth state changed:', event, session?.user?.id);
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Map Supabase user to our User interface
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          };
          setUser(toAppUser(userData));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        } else if (event === 'TOKEN_REFRESHED') {
          // Session was refreshed, update the user data
          if (session?.user) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name,
              name: session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
            };
            setUser(toAppUser(userData));
          }
        }
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        };
        setUser(toAppUser(userData));
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(sanitizeErrorMessage(error));
      throw error;
    }
  };

  // Handle registration
  const register = async (userData: { name: string; email: string; password: string; full_name?: string }): Promise<void> => {
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
        const newUser = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          name: userData.name,
        };
        setUser(toAppUser(newUser));
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(sanitizeErrorMessage(error));
      throw error;
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Add a small delay before navigating to ensure state is cleared
      setTimeout(() => navigate('/login'), 50);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear the user state
      setUser(null);
      setError(sanitizeErrorMessage(err));
      setTimeout(() => navigate('/login'), 50);
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
    isGuest, // Add isGuest to the context value
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
