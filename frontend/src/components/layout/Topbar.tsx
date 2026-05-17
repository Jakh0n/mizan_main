'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const Topbar = () => {
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div>
        <p className="text-xs text-muted-foreground">{workspace?.name || 'Workspace'}</p>
        <h1 className="text-sm font-semibold">{user?.fullName || 'Welcome'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <UserIcon className="h-3.5 w-3.5" />
          {user?.email}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
