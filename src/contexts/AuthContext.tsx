import React, { createContext, useContext, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [loading, setLoading] = React.useState(true);
  const [isGuest, setIsGuest] = React.useState(false);
  
  // Use the global state for user
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const userHasHydrated = useAppStore(state => state.userHasHydrated);

  useEffect(() => {
    // Wait for store to hydrate before proceeding
    if (!userHasHydrated) {
      return;
    }


    // Check for guest mode
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (typeof setUser === 'function') {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (typeof setUser === 'function') {
          setUser(session?.user ?? null);
        }
        setLoading(false);
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('guestMode');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, userHasHydrated]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setLoading(false);
    localStorage.setItem('guestMode', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isGuest, 
      signIn, 
      signUp, 
      signOut, 
      continueAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}