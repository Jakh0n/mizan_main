"use client";

import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/features/analytics/components/StatCard";
import { TrendChart } from "@/features/analytics/components/TrendChart";
import { TopProductsCard } from "@/features/analytics/components/TopProductsCard";
import { LowStockCard } from "@/features/analytics/components/LowStockCard";
import { useOverviewQuery } from "@/features/analytics/hooks/useAnalytics";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const AdminOverview = () => {
  const { data, isLoading } = useOverviewQuery();
  const workspace = useAuthStore((s) => s.workspace);
  const currency = workspace?.currency || "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Realtime snapshot of your inventory and recent activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <StatCard
              label="Total products"
              value={formatNumber(data.totalProducts)}
              icon={Package}
            />
            <StatCard
              label="Units in stock"
              value={formatNumber(data.totalUnits)}
              icon={Boxes}
              tone="success"
            />
            <StatCard
              label="Inventory value"
              value={formatCurrency(data.inventoryValueRetail, currency)}
              hint={`Cost: ${formatCurrency(data.inventoryValueCost, currency)}`}
              icon={DollarSign}
            />
            <StatCard
              label="Low stock"
              value={formatNumber(data.lowStockCount)}
              icon={AlertTriangle}
              tone={data.lowStockCount > 0 ? "warning" : "success"}
            />
          </>
        )}
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Stock in (30 days)"
            value={formatNumber(data.last30Days.in)}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Stock out (30 days)"
            value={formatNumber(data.last30Days.out)}
            icon={TrendingDown}
            tone="destructive"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <LowStockCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsCard />
      </div>
    </div>
  );
};
