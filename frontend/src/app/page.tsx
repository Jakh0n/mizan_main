import Link from 'next/link';
import { ArrowRight, Mic, Send, Sparkles, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice-first updates',
    description:
      'Send a voice message in any language. Whisper transcribes, GPT extracts the inventory events.',
  },
  {
    icon: Send,
    title: 'Telegram-native',
    description:
      'No app to install. Your team already uses Telegram - we plug straight in.',
  },
  {
    icon: Sparkles,
    title: 'AI parsing',
    description:
      'Detects products, quantities, units, and intent (in / out / adjust) automatically.',
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    description:
      'Realtime stock, low-stock alerts, daily trends, and top-moving products.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-linear-to-b from-primary/10 via-background to-background" />

      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Inventory AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="container">
        <section className="flex flex-col items-center pt-16 pb-24 text-center md:pt-24">
          <div className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Built for restaurants, cafes, markets & warehouses
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Manage your inventory by <span className="text-primary">just speaking</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Send a voice note to your Telegram bot like
            <span className="mx-1 rounded-md bg-muted px-1.5 py-0.5 text-foreground">
              &ldquo;20 cola arrived, 5 ayran sold, 2kg meat used&rdquo;
            </span>
            and your stock is updated automatically. No spreadsheets. No clunky software.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login to dashboard</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Inventory AI</span>
          <span>AI Inventory SaaS</span>
        </div>
      </footer>
    </div>
  );
}
