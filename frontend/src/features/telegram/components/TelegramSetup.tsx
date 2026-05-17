'use client';

import { useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: 'Create your Telegram bot',
    description:
      'Open @BotFather in Telegram, send /newbot, choose a name. You will receive a bot token.',
  },
  {
    title: 'Add the token to your backend',
    description:
      'Paste TELEGRAM_BOT_TOKEN into your .env file. Restart the API. Then call POST /telegram/register-webhook from the dashboard.',
  },
  {
    title: 'Link this workspace to a chat',
    description:
      'Open your bot in Telegram, send /start, then send /link followed by the code below.',
  },
  {
    title: 'Send your first voice message',
    description:
      'Try: "20 cola arrived today, 5 ayran sold, 2kg meat used". The bot will update your inventory automatically.',
  },
];

export const TelegramSetup = () => {
  const workspace = useAuthStore((s) => s.workspace);
  const [copied, setCopied] = useState(false);

  const code = workspace?._id || '';
  const command = `/link ${code}`;

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Connection status
          </CardTitle>
          <CardDescription>
            Once linked, voice and text messages to your bot will update this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Workspace link code</p>
              <p className="mt-1 font-mono text-sm">{command}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Chat status</p>
              <p className="mt-1 text-sm font-medium">
                {workspace?.telegramChatId ? 'Linked' : 'Not linked yet'}
              </p>
            </div>
            <Badge variant={workspace?.telegramChatId ? 'success' : 'secondary'}>
              {workspace?.telegramChatId ? 'Active' : 'Pending'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup steps</CardTitle>
          <CardDescription>Follow these steps once per workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {STEPS.map((step, idx) => (
              <li key={step.title} className="flex gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
