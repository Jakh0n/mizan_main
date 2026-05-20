'use client';

import { QrCode } from 'lucide-react';
import type { ProductionFieldDefinition } from '@/types/domain';
import type { DynamicFieldValues } from '../lib/fieldValues';
import { EditableLabelField } from './EditableLabelField';

interface ThermalLabelPreviewProps {
  productName: string;
  productionDate: string;
  expirationDate: string;
  operator: string;
  batchNumber: string;
  quantity: number;
  productionFields?: ProductionFieldDefinition[];
  fieldValues?: DynamicFieldValues;
  activeFieldKey?: string | null;
  onFieldChange?: (key: string, value: string) => void;
  onActivateField?: (key: string) => void;
}

export const ThermalLabelPreview = ({
  productName,
  productionDate,
  expirationDate,
  operator,
  batchNumber,
  quantity,
  productionFields = [],
  fieldValues = {},
  activeFieldKey = null,
  onFieldChange,
  onActivateField,
}: ThermalLabelPreviewProps) => (
  <div className="rounded-lg bg-white p-3 text-slate-900 shadow-md">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          KitchenOS
        </p>
        <p className="mt-0.5 truncate text-base font-bold uppercase">
          {productName || 'Product'}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-900 text-white">
        <QrCode className="h-6 w-6" />
      </div>
    </div>

    <div className="mt-3 space-y-0.5 text-[11px] font-medium">
      <p>
        <span className="text-slate-500">PREP:</span> {productionDate}
      </p>
      <p>
        <span className="text-slate-500">EXP:</span> {expirationDate}
      </p>
      <p>
        <span className="text-slate-500">OPERATOR:</span> {operator}
      </p>

      {productionFields.map((field) =>
        onFieldChange && onActivateField ? (
          <EditableLabelField
            key={field.key}
            field={field}
            value={fieldValues[field.key] ?? ''}
            isActive={activeFieldKey === field.key}
            onChange={(next) => onFieldChange(field.key, next)}
            onActivate={() => onActivateField(field.key)}
          />
        ) : (
          <p key={field.key}>
            <span className="text-slate-500">{field.label.toUpperCase()}:</span>{' '}
            {fieldValues[field.key] ?? ''}
            {field.unit && fieldValues[field.key] ? ` ${field.unit}` : ''}
          </p>
        )
      )}
    </div>

    <div className="mt-2 flex items-end justify-between">
      <p className="font-mono text-[10px] text-slate-500">{batchNumber}</p>
      <p className="text-lg font-extrabold">{quantity}U</p>
    </div>
  </div>
);
