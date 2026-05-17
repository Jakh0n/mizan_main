'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { TelegramSetup } from '@/features/telegram/components/TelegramSetup';

export default function TelegramPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram Bot"
        description="Connect your Telegram bot so staff can update inventory by voice."
      />
      <TelegramSetup />
    </div>
  );
}
