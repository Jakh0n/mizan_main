'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateTransaction } from '@/features/inventory/hooks/useInventory';
import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import type { Product } from '@/types/domain';
import { FAKE_PRODUCTS, isFakeProductId } from '../lib/fakeProducts';
import { buildLabelDetails, type LabelDetail } from '../lib/buildLabelDetails';
import type { DynamicFieldValues } from '../lib/fieldValues';
import { ProductTile } from './ProductTile';
import type { ActiveTarget } from './ProductionSummary';
import { ProductionSummary } from './ProductionSummary';
import type { KeypadKey } from './QuantityKeypad';

interface ProductionLabel {
  id: string;
  productName: string;
  quantity: number;
  productionDate: string;
  expirationDate: string;
  workerName: string;
  batchNumber: string;
  details: LabelDetail[];
}

const QUANTITY_MAX = 99999;

const expiryDays = (product: Product): number => {
  const value = `${product.name} ${product.category ?? ''}`.toLowerCase();
  if (value.includes('salad')) return 1;
  if (value.includes('sauce')) return 3;
  if (value.includes('bread') || value.includes('bun') || value.includes('dough')) return 2;
  if (value.includes('rice')) return 2;
  if (
    value.includes('chicken') ||
    value.includes('meat') ||
    value.includes('beef') ||
    value.includes('doner')
  ) {
    return 2;
  }
  return 3;
};

const makeBatchNumber = (productName: string): string => {
  const prefix =
    productName
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'PROD';
  const timestamp = dayjs().format('YYMMDD-HHmm');
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${rand}`;
};

const formatLabelDate = (date: dayjs.Dayjs): string =>
  date.format('DD MMM YYYY HH:mm').toUpperCase();

const playFeedbackTone = () => {
  if (typeof window === 'undefined') return;

  const BrowserAudioContext =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!BrowserAudioContext) return;

  try {
    const ctx = new BrowserAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.14);
  } catch {
    // Ignore browser-specific audio failures.
  }
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[ch] ?? ch;
  });

const printLabel = (label: ProductionLabel): boolean => {
  if (typeof window === 'undefined') return false;

  const popup = window.open('', '_blank', 'width=420,height=620');
  if (!popup) return false;

  const detailRows = label.details
    .map(
      (detail) =>
        `<div class="row label-row"><strong>${escapeHtml(detail.label)}:</strong> ${escapeHtml(detail.value)}</div>`
    )
    .join('');

  popup.document.write(`
    <html>
      <head>
        <title>Kitchen Label</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 16px; }
          .label { border: 2px solid #111; border-radius: 12px; padding: 14px; width: 320px; }
          .brand { font-size: 10px; letter-spacing: 2px; color: #555; }
          .name { font-weight: 800; font-size: 22px; margin: 4px 0 12px; text-transform: uppercase; }
          .row { margin: 4px 0; font-size: 12px; }
          .label-row strong { color: #555; }
          .batch { font-family: Menlo, Monaco, Consolas, monospace; font-size: 11px; margin-top: 10px; color: #555; }
          .qty { float: right; font-weight: 800; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="brand">KITCHENOS</div>
          <div class="name">${escapeHtml(label.productName)} <span class="qty">${label.quantity}U</span></div>
          <div class="row label-row"><strong>PREP:</strong> ${escapeHtml(label.productionDate)}</div>
          <div class="row label-row"><strong>EXP:</strong> ${escapeHtml(label.expirationDate)}</div>
          <div class="row label-row"><strong>OPERATOR:</strong> ${escapeHtml(label.workerName)}</div>
          ${detailRows}
          <div class="batch">${escapeHtml(label.batchNumber)}</div>
        </div>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  popup.close();
  return true;
};

const applyKeyToText = (
  current: string,
  key: KeypadKey,
  opts: { allowDecimal: boolean }
): string => {
  if (key === 'CLEAR') return '';
  if (key === 'BACK') return current.slice(0, -1);
  if (key === '.') {
    if (!opts.allowDecimal) return current;
    if (current.includes('.')) return current;
    return current === '' ? '0.' : `${current}.`;
  }
  if (current === '' || current === '0') return key;
  return `${current}${key}`;
};

const buildActiveOrder = (product: Product | null): ActiveTarget[] => {
  const fields = product?.productionFields ?? [];
  return [
    { kind: 'quantity' },
    ...fields
      .filter((field) => field.type !== 'select')
      .map((field) => ({ kind: 'field' as const, key: field.key })),
  ];
};

const findActiveIndex = (order: ActiveTarget[], current: ActiveTarget): number =>
  order.findIndex((target) =>
    current.kind === 'quantity'
      ? target.kind === 'quantity'
      : target.kind === 'field' && target.key === current.key
  );

export const KitchenPosDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const workerName = user?.fullName ?? 'CHEF_A1';
  const logout = useLogout();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [batchNumber, setBatchNumber] = useState('BATCH-READY');
  const [productionDayjs, setProductionDayjs] = useState(() => dayjs());
  const [expirationDayjs, setExpirationDayjs] = useState(() => dayjs().add(2, 'day'));
  const [fieldValues, setFieldValues] = useState<DynamicFieldValues>({});
  const [activeTarget, setActiveTarget] = useState<ActiveTarget>({ kind: 'quantity' });

  const createTransaction = useCreateTransaction();

  const { data: productsData } = useProductsQuery({ page: 1, limit: 200 });
  const adminProducts = productsData?.items ?? [];

  const products = adminProducts.length > 0 ? adminProducts : FAKE_PRODUCTS;

  const selectedProduct = useMemo(
    () => products.find((item) => item._id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product._id);
    setQuantity(0);
    const prep = dayjs();
    setProductionDayjs(prep);
    setExpirationDayjs(prep.add(expiryDays(product), 'day'));
    setBatchNumber(makeBatchNumber(product.name));

    const defaults: DynamicFieldValues = {};
    (product.productionFields ?? []).forEach((field) => {
      defaults[field.key] = '';
    });
    setFieldValues(defaults);
    setActiveTarget({ kind: 'quantity' });
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdvanceTarget = () => {
    const order = buildActiveOrder(selectedProduct);
    if (order.length <= 1) return;
    const currentIndex = findActiveIndex(order, activeTarget);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
    const nextTarget = order[nextIndex];
    if (nextTarget) setActiveTarget(nextTarget);
  };

  const handleKeypadPress = (key: KeypadKey) => {
    if (key === 'OK') {
      handleAdvanceTarget();
      return;
    }

    if (activeTarget.kind === 'quantity') {
      const currentStr = quantity === 0 ? '' : quantity.toString();
      const next = applyKeyToText(currentStr, key, { allowDecimal: false });
      const parsed = next === '' ? 0 : Number(next);
      if (!Number.isFinite(parsed)) return;
      setQuantity(Math.min(parsed, QUANTITY_MAX));
      return;
    }

    const fieldKey = activeTarget.key;
    const field = selectedProduct?.productionFields?.find((f) => f.key === fieldKey);
    if (!field || field.type === 'select') return;

    const allowDecimal = field.type === 'number';
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: applyKeyToText(prev[fieldKey] ?? '', key, { allowDecimal }),
    }));
  };

  const validateRequiredFields = (): string | null => {
    const fields = selectedProduct?.productionFields ?? [];
    const missing = fields
      .filter((field) => field.required && !(fieldValues[field.key] ?? '').trim())
      .map((field) => field.label);
    return missing.length > 0 ? `Please fill: ${missing.join(', ')}` : null;
  };

  const serializeFieldValues = (): string => {
    const fields = selectedProduct?.productionFields ?? [];
    if (fields.length === 0) return '';
    const parts = fields
      .map((field) => {
        const raw = fieldValues[field.key];
        if (!raw) return null;
        return `${field.label}: ${raw}${field.unit ? ` ${field.unit}` : ''}`;
      })
      .filter(Boolean);
    return parts.length > 0 ? ` | ${parts.join(', ')}` : '';
  };

  const handlePrint = async () => {
    if (!selectedProduct) {
      toast.error('Select a product first');
      return;
    }
    if (quantity <= 0) {
      toast.error('Enter a quantity using the keypad');
      return;
    }

    const missing = validateRequiredFields();
    if (missing) {
      toast.error(missing);
      return;
    }

    const label: ProductionLabel = {
      id: crypto.randomUUID(),
      productName: selectedProduct.name,
      quantity,
      productionDate: formatLabelDate(productionDayjs),
      expirationDate: formatLabelDate(expirationDayjs),
      workerName,
      batchNumber,
      details: buildLabelDetails(selectedProduct, fieldValues),
    };

    if (isFakeProductId(selectedProduct._id)) {
      const printed = printLabel(label);
      if (!printed) {
        toast.error('Printer popup was blocked by browser');
        return;
      }
      playFeedbackTone();
      toast.success('Demo label printed (admin needs to add this product to save)');
      return;
    }

    const extraNote = serializeFieldValues();

    try {
      await createTransaction.mutateAsync({
        productId: selectedProduct._id,
        type: 'in',
        quantity,
        note: `Kitchen batch ${batchNumber} | EXP ${label.expirationDate} | Worker ${workerName}${extraNote}`,
      });

      const printed = printLabel(label);
      if (!printed) {
        toast.error('Printer popup was blocked by browser');
        return;
      }
      playFeedbackTone();
      setQuantity(0);
      setBatchNumber(makeBatchNumber(selectedProduct.name));

      const resetValues: DynamicFieldValues = {};
      (selectedProduct.productionFields ?? []).forEach((field) => {
        resetValues[field.key] = '';
      });
      setFieldValues(resetValues);
      setActiveTarget({ kind: 'quantity' });
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-slate-100 md:p-6 lg:p-8">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section>
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Production Console
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Touch an item to generate thermal labels.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
                Live Inventory
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product, index) => (
              <ProductTile
                key={product._id}
                product={product}
                index={index}
                selected={product._id === selectedProductId}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>

          {adminProducts.length === 0 && (
            <p className="mt-4 text-xs text-slate-500">
              Showing demo items. Admin can add real products from the admin panel - they will appear here automatically.
            </p>
          )}
        </section>

        <ProductionSummary
          product={selectedProduct}
          workerName={workerName}
          quantity={quantity}
          productionDate={formatLabelDate(productionDayjs)}
          expirationDate={formatLabelDate(expirationDayjs)}
          batchNumber={batchNumber}
          fieldValues={fieldValues}
          activeTarget={activeTarget}
          isSaving={createTransaction.isPending}
          onFieldChange={handleFieldChange}
          onActivate={setActiveTarget}
          onKeypadPress={handleKeypadPress}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
};
