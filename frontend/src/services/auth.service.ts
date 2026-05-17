import { http } from './http';
import type { ApiResponse } from '@/types/api';
import type { AuthResult, User, Workspace } from '@/types/domain';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  industry: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const unwrap = <T>(res: { data: ApiResponse<T> }): T => res.data.data;

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResult> => {
    const res = await http.post<ApiResponse<AuthResult>>('/auth/register', payload);
    return unwrap(res);
  },
  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const res = await http.post<ApiResponse<AuthResult>>('/auth/login', payload);
    return unwrap(res);
  },
  me: async (): Promise<{ user: User; workspace: Workspace }> => {
    const res = await http.get<ApiResponse<{ user: User; workspace: Workspace }>>('/auth/me');
    return unwrap(res);
  },
};
