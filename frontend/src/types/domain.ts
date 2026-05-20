export type Unit = 'pcs' | 'kg' | 'g' | 'l' | 'ml' | 'box' | 'pack';

export type Role = 'admin' | 'owner' | 'manager' | 'staff';

export type Industry = 'restaurant' | 'cafe' | 'market' | 'warehouse' | 'other';

export type TransactionType = 'in' | 'out' | 'adjust';

export type TransactionSource = 'manual' | 'telegram' | 'ai_voice' | 'import';

export interface Workspace {
  _id: string;
  name: string;
  industry: Industry;
  timezone: string;
  currency: string;
  telegramChatId?: string;
  settings: {
    lowStockThreshold: number;
    currencySymbol: string;
    autoCreateProducts?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  workspaceId: string;
  fullName: string;
  email: string;
  role: Role;
  telegramUserId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  workspaceId: string;
  name: string;
  sku?: string;
  category?: string;
  unit: Unit;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  barcode?: string;
  description?: string;
  aliases: string[];
  isArchived: boolean;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  workspaceId: string;
  productId:
    | string
    | {
        _id: string;
        name: string;
        unit: Unit;
        category?: string;
      };
  productName: string;
  type: TransactionType;
  quantity: number;
  unit: Unit;
  previousStock: number;
  newStock: number;
  source: TransactionSource;
  note?: string;
  rawMessage?: string;
  createdBy?: { _id: string; fullName: string; email: string } | string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  totalProducts: number;
  totalUnits: number;
  inventoryValueCost: number;
  inventoryValueRetail: number;
  lowStockCount: number;
  last30Days: { in: number; out: number; adjust: number };
}

export interface TrendPoint {
  _id: { day: string; type: TransactionType };
  quantity: number;
}

export interface TopProduct {
  _id: string;
  productName: string;
  totalQuantity: number;
  transactions: number;
}

export interface AuthResult {
  user: User;
  workspace: Workspace;
  tokens: { accessToken: string; refreshToken: string };
}

export interface AiProcessResult {
  transcript: string;
  language: string;
  summary: string;
  warnings: string[];
  parsedItems: Array<{
    product: string;
    type: TransactionType;
    quantity: number;
    unit: Unit;
    note?: string;
  }>;
  recordResults: Array<
    | { status: 'ok'; transaction: InventoryTransaction; product: Product }
    | { status: 'error'; error: string }
  >;
  createdProducts: Array<{
    name: string;
    quantity: number;
    type: TransactionType;
    unit: Unit;
  }>;
  unresolved: Array<{ product: string; quantity: number; type: TransactionType; unit: Unit }>;
}
