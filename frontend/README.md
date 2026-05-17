# Inventory SaaS — Frontend

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4 + ShadCN-style UI + TanStack Query.

## Tech

- **Next.js 16** (App Router, Turbopack default)
- **React 19**
- **TypeScript 5.7+** (strict, `noUncheckedIndexedAccess`, no `any`)
- **Tailwind CSS v4** (CSS-first config, `@tailwindcss/postcss`)
- **ShadCN-style components** (Radix UI + `class-variance-authority`)
- **TanStack Query v5** for server state
- **Zustand v5** for client state (auth)
- **React Hook Form v7** + **Zod v4**
- **Axios** with token-refresh interceptor
- **Recharts** for analytics
- **Sonner v2** for toasts

## Architecture

Feature-based, with shared UI primitives and isolated services.

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx
    (dashboard)/
      dashboard/page.tsx
      products/page.tsx
      inventory/page.tsx
      ai/page.tsx
      telegram/page.tsx
      settings/page.tsx
      layout.tsx
    layout.tsx
    page.tsx               (public landing)
    globals.css            (Tailwind v4 CSS-first config)

  components/
    providers/             QueryProvider, AppProviders
    layout/                Sidebar, Topbar, PageHeader, AuthGuard
    ui/                    Button, Input, Card, Table, Select, Dialog, ...

  features/
    auth/                  components, hooks
    products/              components, hooks
    inventory/             components, hooks
    analytics/             components, hooks
    ai/                    components, hooks
    telegram/              components

  hooks/                   useDebounce, useApiError
  services/                http, auth, products, inventory, analytics, ai
  store/                   auth.store.ts (zustand)
  lib/                     utils, constants, format-date
  types/                   api, domain
```

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Make sure the backend is running and `NEXT_PUBLIC_API_URL` points to it.

## Tailwind v4 notes

- Configuration is no CSS-first (see `src/app/globals.css`). There is no `tailwind.config.ts`.
- Design tokens are exposed via CSS custom properties + `@theme inline { ... }`.
- Dark mode is enabled via `@custom-variant dark (&:is(.dark *));`.
- Animations are provided by `tw-animate-css` + custom `@keyframes` in `@theme`.

## Notes

- Tokens are stored in `localStorage` and refreshed transparently via an Axios interceptor.
- All API responses are typed (`ApiResponse<T>`).
- Mutations invalidate the related TanStack Query keys to keep the dashboard in sync.
- Recharts is pinned to the 2.15.x line for stable React 19 + Turbopack interaction.
