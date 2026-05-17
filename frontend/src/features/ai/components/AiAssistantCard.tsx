'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useParseText } from '../hooks/useAi';
import type { AiProcessResult } from '@/types/domain';

const SAMPLES = [
  '20 cola arrived today, 5 ayran sold, 2kg meat used',
  'Bought 10 cartons of milk, sold 3 bread',
  'Received 50 boxes of water and used 8kg sugar',
];

export const AiAssistantCard = () => {
  const [text, setText] = useState('');
  const parse = useParseText();
  const [result, setResult] = useState<AiProcessResult | null>(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    parse.mutate(text.trim(), { onSuccess: (data) => setResult(data) });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI text parser
          </CardTitle>
          <CardDescription>
            Type a sentence as you would say to your Telegram bot. The AI extracts products and
            updates inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={4}
            placeholder="e.g. 20 cola arrived today, 5 ayran sold, 2kg meat used"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                type="button"
              >
                {s}
              </button>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={parse.isPending || !text.trim()}>
            {parse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process message
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>Latest parse output</CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <p className="text-sm text-muted-foreground">
              Submit a message to see how the AI interprets it.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {result.summary && (
                <p className="rounded-md border bg-muted/30 p-3">{result.summary}</p>
              )}

              {result.recordResults.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Updated
                  </p>
                  <ul className="space-y-1">
                    {result.recordResults
                      .filter((r) => r.status === 'ok')
                      .map((r, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>{r.transaction.productName}</span>
                          <Badge variant={r.transaction.type === 'in' ? 'success' : 'destructive'}>
                            {r.transaction.type} {r.transaction.quantity} {r.transaction.unit}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {result.unresolved.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-warning">
                    Unresolved products
                  </p>
                  <ul className="space-y-1">
                    {result.unresolved.map((u, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="capitalize">{u.product}</span>
                        <Badge variant="warning">
                          {u.quantity} {u.unit}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
