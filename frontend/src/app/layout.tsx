import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Inventory AI — Voice-powered Inventory Management',
  description:
    'AI-powered inventory management for restaurants, cafes, markets, and warehouses. Update stock with voice messages via Telegram.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
