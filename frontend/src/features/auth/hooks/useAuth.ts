'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { setTokens, clearTokens } from '@/services/http';
import { useAuthStore } from '@/store/auth.store';
import { extractApiError } from '@/hooks/useApiError';

export const useCurrentUser = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authService.me();
      setAuth({ user: data.user, workspace: data.workspace });
      return data;
    },
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setAuth({ user: data.user, workspace: data.workspace });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Welcome back');
      router.push('/dashboard');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};

export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setAuth({ user: data.user, workspace: data.workspace });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Account created');
      router.push('/dashboard');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const qc = useQueryClient();

  return () => {
    clearTokens();
    clearAuth();
    qc.clear();
    router.push('/login');
  };
};
