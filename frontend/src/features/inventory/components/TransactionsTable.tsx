'use client';

import { ArrowDownLeft, ArrowUpRight, Pencil, History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/format-date';
import { formatNumber } from '@/lib/utils';
import type { InventoryTransaction, TransactionType } from '@/types/domain';

interface TransactionsTableProps {
  items: InventoryTransaction[];
  isLoading: boolean;
}

const typeBadge: Record<
  TransactionType,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'; icon: typeof ArrowDownLeft }
> = {
  in: { label: 'Stock In', variant: 'success', icon: ArrowDownLeft },
  out: { label: 'Stock Out', variant: 'destructive', icon: ArrowUpRight },
  adjust: { label: 'Adjusted', variant: 'secondary', icon: Pencil },
};

const sourceLabel: Record<string, string> = {
  manual: 'Manual',
  telegram: 'Telegram',
  ai_voice: 'AI Voice',
  import: 'Import',
};

export const TransactionsTable = ({ items, isLoading }: TransactionsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<History className="h-5 w-5" />}
        title="No transactions yet"
        description="Manual updates and AI-driven changes will appear here."
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Stock change</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => {
            const meta = typeBadge[t.type];
            const Icon = meta.icon;
            return (
              <TableRow key={t._id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(t.createdAt)}
                </TableCell>
                <TableCell className="font-medium">{t.productName}</TableCell>
                <TableCell>
                  <Badge variant={meta.variant} className="gap-1">
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(t.quantity)} <span className="text-xs text-muted-foreground">{t.unit}</span>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {t.previousStock} → <span className="font-medium text-foreground">{t.newStock}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{sourceLabel[t.source] || t.source}</Badge>
                </TableCell>
                <TableCell className="max-w-[16rem] truncate text-sm text-muted-foreground">
                  {t.note || t.rawMessage || '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
