'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiService } from '@/services/ai.service';
import { extractApiError } from '@/hooks/useApiError';

export const useParseText = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => aiService.parseText(text),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      const ok = data.recordResults.filter((r) => r.status === 'ok').length;
      toast.success(`Processed: ${ok} item${ok === 1 ? '' : 's'} updated`);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
};
