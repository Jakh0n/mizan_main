'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Workspace and account information." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your profile and role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Full name" value={user?.fullName} />
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Business and currency settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Business name" value={workspace?.name} />
            <Row label="Industry" value={workspace?.industry} />
            <Row label="Currency" value={workspace?.currency} />
            <Row label="Timezone" value={workspace?.timezone} />
            <Row
              label="Low stock threshold (default)"
              value={String(workspace?.settings?.lowStockThreshold ?? '')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || '—'}</span>
  </div>
);
