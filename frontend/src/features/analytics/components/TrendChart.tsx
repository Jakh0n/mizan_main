'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendQuery } from '../hooks/useAnalytics';
import type { TrendPoint } from '@/types/domain';

interface ChartRow {
  day: string;
  in: number;
  out: number;
}

const buildRows = (points: TrendPoint[]): ChartRow[] => {
  const map = new Map<string, ChartRow>();
  points.forEach((p) => {
    const day = p._id.day;
    const existing = map.get(day) || { day, in: 0, out: 0 };
    if (p._id.type === 'in') existing.in = p.quantity;
    else if (p._id.type === 'out') existing.out = p.quantity;
    map.set(day, existing);
  });
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
};

export const TrendChart = () => {
  const { data, isLoading } = useTrendQuery(14);
  const rows = useMemo(() => buildRows(data || []), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock movement (14 days)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="in"
                name="In"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="out"
                name="Out"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
