'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import type { Product } from '@/types/domain';
import type { ProductPayload } from '@/services/products.service';

interface ProductDialogProps {
  product?: Product;
  triggerLabel?: string;
  asIconButton?: boolean;
  trigger?: React.ReactNode;
}

export const ProductDialog = ({
  product,
  triggerLabel = 'New product',
  trigger,
}: ProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEdit = Boolean(product);

  const handleSubmit = (payload: ProductPayload) => {
    if (isEdit && product) {
      updateMutation.mutate(
        { id: product._id, payload },
        { onSuccess: () => setOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </div>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update product details. Stock is changed through transactions.'
              : 'Add a product so the AI can recognize it from voice messages.'}
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
