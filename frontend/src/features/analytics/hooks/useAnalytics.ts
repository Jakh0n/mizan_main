'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type { TransactionType } from '@/types/domain';

export const useOverviewQuery = () =>
  useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.overview(),
  });

export const useTrendQuery = (days = 14) =>
  useQuery({
    queryKey: ['analytics', 'trend', days],
    queryFn: () => analyticsService.trend(days),
  });

export const useTopProductsQuery = (params: {
  type?: TransactionType;
  days?: number;
  limit?: number;
} = {}) =>
  useQuery({
    queryKey: ['analytics', 'top-products', params],
    queryFn: () => analyticsService.topProducts(params),
  });

export const useLowStockQuery = (limit = 10) =>
  useQuery({
    queryKey: ['analytics', 'low-stock', limit],
    queryFn: () => analyticsService.lowStock(limit),
  });
