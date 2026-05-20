'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getAccessToken } from '@/services/http';
import { getDefaultRouteByRole, isAdminRole, isWorkerRole } from '@/lib/roles';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    const token = getAccessToken();
    if (!user || !token) {
      router.replace('/login');
      return;
    }

    const workerOnlyPrefixes = ['/worker', '/production'];
    const adminOnlyPrefixes = ['/admin', '/dashboard', '/products', '/inventory', '/ai', '/telegram', '/settings'];
    const currentPath = pathname || '';

    const isWorkerOnlyPath = workerOnlyPrefixes.some(
      (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)
    );
    const isAdminOnlyPath = adminOnlyPrefixes.some(
      (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)
    );

    if (isWorkerRole(user.role) && isAdminOnlyPath) {
      router.replace(getDefaultRouteByRole(user.role));
      return;
    }

    if (isAdminRole(user.role) && isWorkerOnlyPath) {
      router.replace(getDefaultRouteByRole(user.role));
    }
  }, [hydrated, pathname, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
