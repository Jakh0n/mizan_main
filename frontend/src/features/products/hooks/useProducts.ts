'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  productsService,
  type ProductListQuery,
  type ProductPayload,
} from '@/services/products.service';
import { extractApiError } from '@/hooks/useApiError';

const productsKey = (query: ProductListQuery) => ['products', query] as const;

export const useProductsQuery = (query: ProductListQuery = {}) =>
  useQuery({
    queryKey: productsKey(query),
    queryFn: () => productsService.list(query),
    placeholderData: (prev) => prev,
  });

export const useProductQuery = (id: string | undefined) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.get(id as string),
    enabled: Boolean(id),
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Product created');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Product updated');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product archived');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};
