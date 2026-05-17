'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useProductsQuery } from '@/features/products/hooks/useProducts';
import { useCreateTransaction } from '../hooks/useInventory';
import { TRANSACTION_TYPES } from '@/lib/constants';

const schema = z.object({
  productId: z.string().min(1, 'Product is required'),
  type: z.enum(['in', 'out', 'adjust']),
  quantity: z.coerce.number().positive('Must be positive'),
  note: z.string().max(500).optional().or(z.literal('')),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const TransactionDialog = () => {
  const [open, setOpen] = useState(false);
  const { data: productsData } = useProductsQuery({ limit: 100 });
  const createMutation = useCreateTransaction();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', type: 'in', quantity: 1, note: '' },
  });

  const onSubmit = (values: FormOutput) => {
    createMutation.mutate(
      {
        productId: values.productId,
        type: values.type,
        quantity: values.quantity,
        note: values.note || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset({ productId: '', type: 'in', quantity: 1, note: '' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New transaction
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record inventory transaction</DialogTitle>
          <DialogDescription>
            Manually add or remove stock. AI updates from Telegram also appear in this history.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {(productsData?.items || []).map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} ({p.stock} {p.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productId && (
              <p className="text-xs text-destructive">{errors.productId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                {...register('quantity')}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={2} {...register('note')} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
