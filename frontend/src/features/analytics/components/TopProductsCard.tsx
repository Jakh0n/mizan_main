'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopProductsQuery } from '../hooks/useAnalytics';
import { formatNumber } from '@/lib/utils';

export const TopProductsCard = () => {
  const { data, isLoading } = useTopProductsQuery({ type: 'out', days: 30, limit: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top moving products (30d)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sales recorded yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.map((row, idx) => (
              <li
                key={row._id}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{row.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.transactions} transactions
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatNumber(row.totalQuantity)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
