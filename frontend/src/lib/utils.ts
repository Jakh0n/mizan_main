import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return `${(value || 0).toFixed(2)}`;
  }
};

export const formatNumber = (value: number, locale: string = 'en-US'): string =>
  new Intl.NumberFormat(locale).format(value || 0);

export const formatPercent = (value: number, fractionDigits: number = 1): string =>
  `${(value || 0).toFixed(fractionDigits)}%`;
