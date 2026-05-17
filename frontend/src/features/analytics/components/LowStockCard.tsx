'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLowStockQuery } from '../hooks/useAnalytics';

export const LowStockCard = () => {
  const { data, isLoading } = useLowStockQuery(8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Low stock alerts
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products?lowStock=1">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            All products are well-stocked.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Threshold: {p.lowStockThreshold} {p.unit}
                  </p>
                </div>
                <Badge variant="warning">
                  {p.stock} {p.unit}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
