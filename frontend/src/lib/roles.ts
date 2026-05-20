import type { Role } from '@/types/domain';

export const isWorkerRole = (role: Role): boolean => role === 'staff';

export const isAdminRole = (role: Role): boolean =>
  role === 'admin' || role === 'owner' || role === 'manager';

export const getDefaultRouteByRole = (role: Role): string =>
  isWorkerRole(role) ? '/worker/production' : '/admin';
