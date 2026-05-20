'use client';

import { cn } from '@/lib/utils';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'CLEAR'] as const;

interface QuantityKeypadProps {
  value: number;
  onChange: (next: number) => void;
}

export const QuantityKeypad = ({ value, onChange }: QuantityKeypadProps) => {
  const handlePress = (key: string) => {
    if (key === 'CLEAR') {
      onChange(0);
      return;
    }
    if (key === '.') {
      return;
    }
    const current = value.toString();
    const next = current === '0' ? key : `${current}${key}`;
    const parsed = Number(next);
    if (!Number.isFinite(parsed)) return;
    onChange(Math.min(parsed, 99999));
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handlePress(key)}
          className={cn(
            'flex h-16 items-center justify-center rounded-xl text-lg font-semibold transition-colors',
            key === 'CLEAR'
              ? 'bg-slate-900/60 text-rose-400 hover:bg-slate-800'
              : 'bg-slate-900/60 text-slate-100 hover:bg-slate-800'
          )}
        >
          {key}
        </button>
      ))}
    </div>
  );
};
