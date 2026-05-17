import { http } from './http';
import type { ApiResponse } from '@/types/api';
import type { AiProcessResult } from '@/types/domain';

export const aiService = {
  parseText: async (text: string): Promise<AiProcessResult> => {
    const { data } = await http.post<ApiResponse<AiProcessResult>>('/ai/parse-text', { text });
    return data.data;
  },
};
