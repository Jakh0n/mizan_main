'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductionFieldDefinition, ProductionFieldType } from '@/types/domain';

const FIELD_TYPES: { value: ProductionFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
];

const toKey = (label: string): string =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || `field_${Date.now()}`;

interface ProductionFieldsEditorProps {
  value: ProductionFieldDefinition[];
  onChange: (next: ProductionFieldDefinition[]) => void;
}

export const ProductionFieldsEditor = ({ value, onChange }: ProductionFieldsEditorProps) => {
  const updateField = (index: number, patch: Partial<ProductionFieldDefinition>) => {
    const next = value.map((field, i) => (i === index ? { ...field, ...patch } : field));
    onChange(next);
  };

  const addField = () => {
    onChange([
      ...value,
      {
        key: `field_${value.length + 1}`,
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        unit: '',
        options: [],
      },
    ]);
  };

  const removeField = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/10 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="text-sm font-semibold">Worker fields</Label>
          <p className="text-xs text-muted-foreground">
            Define fields the worker must fill when producing this item.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addField}>
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No custom fields. Worker will only enter quantity.
        </p>
      )}

      {value.map((field, index) => (
        <div key={index} className="space-y-2 rounded-md border bg-background p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <div className="space-y-1 sm:col-span-5">
              <Label className="text-xs">Field label</Label>
              <Input
                value={field.label}
                placeholder="e.g. Weight per piece"
                onChange={(e) =>
                  updateField(index, {
                    label: e.target.value,
                    key: field.key && field.key.startsWith('field_') ? toKey(e.target.value) : field.key,
                  })
                }
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <Label className="text-xs">Type</Label>
              <Select
                value={field.type}
                onValueChange={(v) => updateField(index, { type: v as ProductionFieldType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Unit</Label>
              <Input
                value={field.unit ?? ''}
                placeholder="g, %, ..."
                onChange={(e) => updateField(index, { unit: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Required
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(index)}
                className="ml-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {field.type === 'select' && (
            <div className="space-y-1">
              <Label className="text-xs">Options (comma-separated)</Label>
              <Input
                value={(field.options ?? []).join(', ')}
                placeholder="Small, Medium, Large"
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value
                      .split(',')
                      .map((opt) => opt.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}

          {field.type !== 'select' && (
            <div className="space-y-1">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder ?? ''}
                placeholder="Hint shown to worker"
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
