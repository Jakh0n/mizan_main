'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionDialog } from '@/features/inventory/components/TransactionDialog';
import { TransactionsTable } from '@/features/inventory/components/TransactionsTable';
import { useTransactionsQuery } from '@/features/inventory/hooks/useInventory';
import { TRANSACTION_TYPES, TRANSACTION_SOURCES } from '@/lib/constants';
import type { TransactionType } from '@/types/domain';

const ALL = 'all';

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TransactionType | typeof ALL>(ALL);
  const [source, setSource] = useState<string>(ALL);

  const { data, isLoading, isFetching } = useTransactionsQuery({
    page,
    limit: 20,
    type: type === ALL ? undefined : type,
    source: source === ALL ? undefined : source,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="History of every stock change — manual, Telegram, or AI-driven."
        actions={<TransactionDialog />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={type} onValueChange={(v) => setType(v as TransactionType | typeof ALL)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All sources</SelectItem>
              {TRANSACTION_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data?.pagination && (
          <Badge variant="secondary">
            {data.pagination.total} record{data.pagination.total === 1 ? '' : 's'}
          </Badge>
        )}
      </div>

      <TransactionsTable items={data?.items ?? []} isLoading={isLoading} />

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
