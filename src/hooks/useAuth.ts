
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, RegisterData } from '@/services/auth';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('meshmemory-token', data.token);
      localStorage.removeItem('meshmemory-guest');
      queryClient.setQueryData(['user'], data.user);
      toast.success('Successfully logged in!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem('meshmemory-token', data.token);
      localStorage.removeItem('meshmemory-guest');
      queryClient.setQueryData(['user'], data.user);
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('meshmemory-token');
      localStorage.removeItem('meshmemory-guest');
      queryClient.clear();
      toast.success('Logged out successfully');
    }
  });

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (userData: RegisterData) => {
    return registerMutation.mutateAsync(userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
