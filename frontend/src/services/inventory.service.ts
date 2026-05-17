import { http } from './http';
import type { ApiResponse, Pagination } from '@/types/api';
import type { InventoryTransaction, TransactionType } from '@/types/domain';

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  productId?: string;
  type?: TransactionType;
  source?: string;
  from?: string;
  to?: string;
}

export interface TransactionPayload {
  productId: string;
  type: TransactionType;
  quantity: number;
  note?: string;
}

export interface TransactionListResult {
  items: InventoryTransaction[];
  pagination: Pagination;
}

export const inventoryService = {
  list: async (query: TransactionListQuery = {}): Promise<TransactionListResult> => {
    const { data } = await http.get<ApiResponse<InventoryTransaction[]>>(
      '/inventory/transactions',
      { params: query }
    );
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
  create: async (payload: TransactionPayload): Promise<InventoryTransaction> => {
    const { data } = await http.post<
      ApiResponse<{ transaction: InventoryTransaction }>
    >('/inventory/transactions', payload);
    return data.data.transaction;
  },
};
