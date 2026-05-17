'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { AiAssistantCard } from '@/features/ai/components/AiAssistantCard';

export default function AiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Preview how the AI parses natural-language inventory updates."
      />
      <AiAssistantCard />
    </div>
  );
}
