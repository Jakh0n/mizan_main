import type { Product } from '@/types/domain';
import type { DynamicFieldValues } from './fieldValues';

export interface LabelDetail {
  label: string;
  value: string;
}

export const buildLabelDetails = (
  product: Product | null,
  values: DynamicFieldValues
): LabelDetail[] => {
  const fields = product?.productionFields ?? [];
  return fields
    .map((field): LabelDetail | null => {
      const raw = (values[field.key] ?? '').trim();
      if (!raw) return null;
      const unit = field.unit ? ` ${field.unit}` : '';
      return {
        label: field.label.toUpperCase(),
        value: `${raw}${unit}`,
      };
    })
    .filter((item): item is LabelDetail => item !== null);
};
