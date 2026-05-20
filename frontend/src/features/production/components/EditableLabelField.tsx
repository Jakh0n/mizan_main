'use client';

import { cn } from '@/lib/utils';
import type { ProductionFieldDefinition } from '@/types/domain';

interface EditableLabelFieldProps {
  field: ProductionFieldDefinition;
  value: string;
  isActive: boolean;
  onChange: (next: string) => void;
  onActivate: () => void;
}

const baseInputClass = cn(
  'w-full max-w-[150px] bg-transparent text-[11px] font-semibold uppercase tracking-wide',
  'border-b border-dashed border-slate-400 focus:outline-none',
  'placeholder:text-slate-400 placeholder:font-normal placeholder:normal-case'
);

export const EditableLabelField = ({
  field,
  value,
  isActive,
  onChange,
  onActivate,
}: EditableLabelFieldProps) => {
  const labelText = field.required ? `${field.label.toUpperCase()} *` : field.label.toUpperCase();

  const activeClass = isActive
    ? 'border-solid border-lime-500 bg-lime-50/70 text-slate-900'
    : 'border-dashed border-slate-400';

  if (field.type === 'select') {
    return (
      <p className="flex items-center gap-1.5">
        <span className="shrink-0 text-slate-500">{labelText}:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseInputClass, 'cursor-pointer pr-1')}
        >
          <option value="">—</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {field.unit && value && <span className="text-slate-500">{field.unit}</span>}
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5">
      <span className="shrink-0 text-slate-500">{labelText}:</span>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onActivate}
        onClick={onActivate}
        placeholder={field.placeholder ?? 'tap'}
        inputMode={field.type === 'number' ? 'decimal' : 'text'}
        className={cn(baseInputClass, activeClass)}
      />
      {field.unit && value && <span className="text-slate-500">{field.unit}</span>}
    </p>
  );
};
