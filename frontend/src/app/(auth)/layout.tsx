import type { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
            <Sparkles className="h-4 w-4" />
          </div>
          Inventory AI
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Run your inventory by voice.
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/80">
            Built for restaurants, cafes, markets and small warehouses. Replace spreadsheets
            with a Telegram voice note.
          </p>
        </div>

        <footer className="text-xs text-white/70">
          AI-powered Inventory Management for modern operators
        </footer>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
