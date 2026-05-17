'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UNITS } from '@/lib/constants';
import type { Product, Unit } from '@/types/domain';
import type { ProductPayload } from '@/services/products.service';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(160),
  sku: z.string().max(64).optional().or(z.literal('')),
  category: z.string().max(64).optional().or(z.literal('')),
  unit: z.enum(['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack']),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  barcode: z.string().max(64).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  aliases: z.string().optional().or(z.literal('')),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (payload: ProductPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const toAliasesArray = (val?: string): string[] =>
  val
    ? val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const ProductForm = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      category: product?.category ?? '',
      unit: (product?.unit as Unit) ?? 'pcs',
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      stock: product?.stock ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 5,
      barcode: product?.barcode ?? '',
      description: product?.description ?? '',
      aliases: product?.aliases?.join(', ') ?? '',
    },
  });

  const submit = (values: FormOutput) => {
    const payload: ProductPayload = {
      name: values.name,
      unit: values.unit,
      price: values.price,
      cost: values.cost,
      stock: values.stock,
      lowStockThreshold: values.lowStockThreshold,
      sku: values.sku || undefined,
      category: values.category || undefined,
      barcode: values.barcode || undefined,
      description: values.description || undefined,
      aliases: toAliasesArray(values.aliases),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Cola 0.5L" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register('sku')} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register('category')} placeholder="Drinks, Bakery..." />
        </div>

        <div className="space-y-2">
          <Label>Unit</Label>
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" {...register('barcode')} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <Input id="cost" type="number" step="0.01" {...register('cost')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" step="1" {...register('stock')} disabled={!!product} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            step="1"
            {...register('lowStockThreshold')}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="aliases">Aliases (comma-separated)</Label>
          <Input
            id="aliases"
            {...register('aliases')}
            placeholder="kola, coca cola, кока-кола"
          />
          <p className="text-xs text-muted-foreground">
            Helps AI match voice commands to this product.
          </p>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register('description')} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
};
