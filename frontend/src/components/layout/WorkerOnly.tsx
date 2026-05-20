'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRouteByRole, isWorkerRole } from '@/lib/roles';

interface WorkerOnlyProps {
  children: ReactNode;
}

export const WorkerOnly = ({ children }: WorkerOnlyProps) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (!isWorkerRole(user.role)) {
      router.replace(getDefaultRouteByRole(user.role));
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user || !isWorkerRole(user.role)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
