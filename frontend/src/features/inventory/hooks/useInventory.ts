'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  inventoryService,
  type TransactionListQuery,
  type TransactionPayload,
} from '@/services/inventory.service';
import { extractApiError } from '@/hooks/useApiError';

export const useTransactionsQuery = (query: TransactionListQuery = {}) =>
  useQuery({
    queryKey: ['transactions', query],
    queryFn: () => inventoryService.list(query),
    placeholderData: (prev) => prev,
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionPayload) => inventoryService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction recorded');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};
