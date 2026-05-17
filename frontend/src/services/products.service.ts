import { http } from './http';
import type { ApiResponse, Pagination } from '@/types/api';
import type { Product, Unit } from '@/types/domain';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export interface ProductPayload {
  name: string;
  sku?: string;
  category?: string;
  unit: Unit;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  barcode?: string;
  description?: string;
  aliases?: string[];
}

export interface ProductListResult {
  items: Product[];
  pagination: Pagination;
}

export const productsService = {
  list: async (query: ProductListQuery = {}): Promise<ProductListResult> => {
    const { data } = await http.get<ApiResponse<Product[]>>('/products', { params: query });
    return {
      items: data.data,
      pagination: data.meta?.pagination ?? {
        total: data.data.length,
        page: 1,
        limit: data.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },
  get: async (id: string): Promise<Product> => {
    const { data } = await http.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },
  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await http.post<ApiResponse<Product>>('/products', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await http.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await http.delete(`/products/${id}`);
  },
};
