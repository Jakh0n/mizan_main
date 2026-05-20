'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/domain';
import type { DynamicFieldValues } from '../lib/fieldValues';
import type { KeypadKey } from './QuantityKeypad';
import { QuantityKeypad } from './QuantityKeypad';
import { ThermalLabelPreview } from './ThermalLabelPreview';

export type ActiveTarget = { kind: 'quantity' } | { kind: 'field'; key: string };

interface ProductionSummaryProps {
  product: Product | null;
  workerName: string;
  quantity: number;
  productionDate: string;
  expirationDate: string;
  batchNumber: string;
  fieldValues: DynamicFieldValues;
  activeTarget: ActiveTarget;
  isSaving: boolean;
  onFieldChange: (key: string, value: string) => void;
  onActivate: (target: ActiveTarget) => void;
  onKeypadPress: (key: KeypadKey) => void;
  onPrint: () => void;
}

export const ProductionSummary = ({
  product,
  workerName,
  quantity,
  productionDate,
  expirationDate,
  batchNumber,
  fieldValues,
  activeTarget,
  isSaving,
  onFieldChange,
  onActivate,
  onKeypadPress,
  onPrint,
}: ProductionSummaryProps) => {
  const productLabel = product?.name ?? 'No item selected';
  const productionFields = product?.productionFields ?? [];
  const isQuantityActive = activeTarget.kind === 'quantity';

  const activeField =
    activeTarget.kind === 'field'
      ? productionFields.find((field) => field.key === activeTarget.key) ?? null
      : null;

  const headerLabel = isQuantityActive
    ? 'Enter quantity'
    : `Filling: ${activeField?.label ?? ''}`;

  return (
    <aside className="flex h-full min-h-[700px] flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-400">
          Labeling action
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">{productLabel}</h2>
        <p className="text-xs text-slate-400">
          {productionFields.length > 0
            ? 'Tap a label row, then use the numpad.'
            : 'Thermal Preview'}
        </p>
      </div>

      <ThermalLabelPreview
        productName={productLabel}
        productionDate={productionDate}
        expirationDate={expirationDate}
        operator={workerName}
        batchNumber={batchNumber}
        quantity={quantity}
        productionFields={productionFields}
        fieldValues={fieldValues}
        activeFieldKey={activeTarget.kind === 'field' ? activeTarget.key : null}
        onFieldChange={onFieldChange}
        onActivateField={(key) => onActivate({ kind: 'field', key })}
      />

      <div className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {headerLabel}
        </p>
        <button
          type="button"
          onClick={() => onActivate({ kind: 'quantity' })}
          className={cn(
            'mx-auto block rounded-xl px-6 py-1 text-5xl font-extrabold tabular-nums transition-all',
            isQuantityActive
              ? 'text-lime-400 ring-2 ring-lime-400/40'
              : 'text-slate-500 hover:text-lime-300'
          )}
        >
          {quantity}
        </button>
      </div>

      <QuantityKeypad onPress={onKeypadPress} />

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
