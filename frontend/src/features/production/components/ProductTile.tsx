'use client';

import { cn } from '@/lib/utils';
import type { Product } from '@/types/domain';

const PASTEL_PALETTE = [
  'bg-cyan-200 text-slate-900',
  'bg-rose-200 text-slate-900',
  'bg-emerald-200 text-slate-900',
  'bg-sky-200 text-slate-900',
  'bg-amber-200 text-slate-900',
] as const;

interface ProductTileProps {
  product: Product;
  index: number;
  selected: boolean;
  onSelect: (product: Product) => void;
}

export const ProductTile = ({ product, index, selected, onSelect }: ProductTileProps) => {
  const color = PASTEL_PALETTE[index % PASTEL_PALETTE.length];

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={cn(
        'flex h-28 items-center justify-center rounded-2xl p-3 text-center transition-all',
        color,
        selected
          ? 'ring-4 ring-lime-400 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-lime-400/20'
          : 'hover:scale-[1.02] hover:shadow-md'
      )}
    >
      <span className="text-sm font-bold uppercase leading-tight tracking-wide">
        {product.name}
      </span>
    </button>
  );
};
