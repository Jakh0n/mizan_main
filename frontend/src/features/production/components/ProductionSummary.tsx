'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/domain';
import { QuantityKeypad } from './QuantityKeypad';
import { ThermalLabelPreview } from './ThermalLabelPreview';

interface ProductionSummaryProps {
  product: Product | null;
  workerName: string;
  quantity: number;
  productionDate: string;
  expirationDate: string;
  batchNumber: string;
  isSaving: boolean;
  onQuantityChange: (next: number) => void;
  onPrint: () => void;
}

export const ProductionSummary = ({
  product,
  workerName,
  quantity,
  productionDate,
  expirationDate,
  batchNumber,
  isSaving,
  onQuantityChange,
  onPrint,
}: ProductionSummaryProps) => {
  const productLabel = product?.name ?? 'No item selected';

  return (
    <aside className="flex h-full min-h-[700px] flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-400">
          Labeling action
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">{productLabel}</h2>
        <p className="text-xs text-slate-400">Thermal Preview</p>
      </div>

      <ThermalLabelPreview
        productName={productLabel}
        productionDate={productionDate}
        expirationDate={expirationDate}
        operator={workerName}
        batchNumber={batchNumber}
        quantity={quantity}
      />

      <div className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Enter quantity
        </p>
        <p className="text-5xl font-extrabold text-lime-400 tabular-nums">{quantity}</p>
      </div>

      <QuantityKeypad value={quantity} onChange={onQuantityChange} />

      <div className="mt-auto">
        <Button
          type="button"
          onClick={onPrint}
          disabled={!product || isSaving || quantity <= 0}
          className="h-16 w-full rounded-xl bg-lime-400 text-base font-bold uppercase tracking-wide text-slate-950 shadow-lg shadow-lime-400/30 hover:bg-lime-300"
        >
          <Printer className="h-5 w-5" />
          {isSaving ? 'Printing...' : 'Print Label'}
        </Button>
      </div>
    </aside>
  );
};
