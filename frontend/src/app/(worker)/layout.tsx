import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { WorkerOnly } from '@/components/layout/WorkerOnly';

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <WorkerOnly>
        <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>
      </WorkerOnly>
    </AuthGuard>
  );
}
