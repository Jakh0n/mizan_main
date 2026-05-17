'use client';

import { useState } from 'react';
import { Pencil, Trash2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Product } from '@/types/domain';
import { ProductDialog } from './ProductDialog';
import { useDeleteProduct } from '../hooks/useProducts';

interface ProductsTableProps {
  items: Product[];
  isLoading: boolean;
}

export const ProductsTable = ({ items, isLoading }: ProductsTableProps) => {
  const workspace = useAuthStore((s) => s.workspace);
  const currency = workspace?.currency || 'USD';
  const deleteMutation = useDeleteProduct();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<Package className="h-5 w-5" />}
        title="No products yet"
        description="Add your first product to start tracking inventory."
        action={<ProductDialog triggerLabel="Add product" />}
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => {
            const isLow = p.stock <= p.lowStockThreshold;
            return (
              <TableRow key={p._id}>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  {p.sku && (
                    <div className="text-xs text-muted-foreground">SKU: {p.sku}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.category || '—'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(p.stock)} <span className="text-xs text-muted-foreground">{p.unit}</span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(p.price, currency)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.stock * p.price, currency)}
                </TableCell>
                <TableCell>
                  {isLow ? (
                    <Badge variant="warning">Low stock</Badge>
                  ) : (
                    <Badge variant="secondary">In stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ProductDialog
                      product={p}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => {
                        if (confirmId === p._id) {
                          deleteMutation.mutate(p._id);
                          setConfirmId(null);
                        } else {
                          setConfirmId(p._id);
                          setTimeout(() => setConfirmId(null), 2000);
                        }
                      }}
                    >
                      <Trash2
                        className={`h-4 w-4 ${
                          confirmId === p._id ? 'text-destructive' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
