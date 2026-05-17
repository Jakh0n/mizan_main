import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

export const extractApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.details?.length) {
      return data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
    }
    if (data?.message) return data.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
