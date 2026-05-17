'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductDialog } from '@/features/products/components/ProductDialog';
import { ProductsTable } from '@/features/products/components/ProductsTable';
import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching } = useProductsQuery({
    page,
    limit: 20,
    search: debouncedSearch,
    lowStock: lowStockOnly || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your catalog. Aliases improve voice matching."
        actions={<ProductDialog />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or alias..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={lowStockOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
          >
            Low stock only
          </Button>
          {data?.pagination && (
            <Badge variant="secondary">
              {data.pagination.total} product{data.pagination.total === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
      </div>

      <ProductsTable items={data?.items ?? []} isLoading={isLoading} />

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasPrev || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasNext || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
