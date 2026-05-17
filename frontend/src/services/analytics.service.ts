import { http } from './http';
import type { ApiResponse } from '@/types/api';
import type {
  DashboardOverview,
  Product,
  TopProduct,
  TransactionType,
  TrendPoint,
} from '@/types/domain';

export const analyticsService = {
  overview: async (): Promise<DashboardOverview> => {
    const { data } = await http.get<ApiResponse<DashboardOverview>>('/analytics/overview');
    return data.data;
  },
  trend: async (days = 14): Promise<TrendPoint[]> => {
    const { data } = await http.get<ApiResponse<TrendPoint[]>>('/analytics/trend', {
      params: { days },
    });
    return data.data;
  },
  topProducts: async (params: { type?: TransactionType; days?: number; limit?: number } = {}): Promise<TopProduct[]> => {
    const { data } = await http.get<ApiResponse<TopProduct[]>>('/analytics/top-products', {
      params,
    });
    return data.data;
  },
  lowStock: async (limit = 10): Promise<Product[]> => {
    const { data } = await http.get<ApiResponse<Product[]>>('/analytics/low-stock', {
      params: { limit },
    });
    return data.data;
  },
};
