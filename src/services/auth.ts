import { supabase } from './supabase';

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

class AuthService {
  // Login with email and password
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    return {
      user: this.mapSupabaseUser(data.user),
      session: data.session,
    };
  }

  // Register new user
  async register(userData: { email: string; password: string; name: string; full_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          full_name: userData.full_name || userData.name,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      throw error;
    }

    return {
      user: data.user ? this.mapSupabaseUser(data.user) : null,
      session: data.session,
    };
  }

  // Sign in with OAuth providers
  async signInWithOAuth(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/oauth/callback`,
      },
    });

    if (error) {
      console.error(`${provider} sign in error:`, error);
      throw error;
    }

    return data;
  }

  // Get access token
  async getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
  
  // Handle OAuth callback
  async handleOAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('OAuth callback error:', error || 'No session found');
      throw error || new Error('No session found');
    }

    return {
      user: this.mapSupabaseUser(session.user),
      session,
    };
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return this.mapSupabaseUser(user);
  }

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return supabase.auth.getSession().then(({ data: { session } }) => !!session);
  }

  // Helper to map Supabase user to our User type
  private mapSupabaseUser(user: any): User {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      is_active: true,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  // Clear authentication data
  async clearAuthData() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export const authService = new AuthService();
