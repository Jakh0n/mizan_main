export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const STORAGE_KEYS = {
  accessToken: 'inv_access_token',
  refreshToken: 'inv_refresh_token',
} as const;

export const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack'] as const;

export const INDUSTRIES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'market', label: 'Market' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'adjust', label: 'Adjust' },
] as const;

export const TRANSACTION_SOURCES = [
  { value: 'manual', label: 'Manual' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'ai_voice', label: 'AI Voice' },
  { value: 'import', label: 'Import' },
] as const;
