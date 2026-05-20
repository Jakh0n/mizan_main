'use client';

import { cn } from '@/lib/utils';

export type KeypadKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | 'BACK'
  | 'CLEAR'
  | 'OK';

const NUMERIC_KEYS: KeypadKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  '0',
  'BACK',
];

interface QuantityKeypadProps {
  onPress: (key: KeypadKey) => void;
}

const numericClass = cn(
  'flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-colors',
  'bg-slate-900/60 text-slate-100 hover:bg-slate-800'
);

const renderKeyLabel = (key: KeypadKey): string => (key === 'BACK' ? '⌫' : key);

export const QuantityKeypad = ({ onPress }: QuantityKeypadProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-3">
      {NUMERIC_KEYS.map((key) => (
        <button key={key} type="button" onClick={() => onPress(key)} className={numericClass}>
          {renderKeyLabel(key)}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onPress('CLEAR')}
        className="flex h-14 items-center justify-center rounded-xl bg-rose-500/15 text-base font-semibold uppercase tracking-wide text-rose-300 transition-colors hover:bg-rose-500/25"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => onPress('OK')}
        className="flex h-14 items-center justify-center rounded-xl bg-lime-400/20 text-base font-semibold uppercase tracking-wide text-lime-300 transition-colors hover:bg-lime-400/30"
      >
        OK
      </button>
    </div>
  </div>
);
