# Inventory AI — Voice-powered Inventory Management SaaS

Modern, production-grade SaaS that lets business owners manage inventory by sending
voice messages to a Telegram bot. Whisper transcribes, GPT extracts inventory events,
and the backend updates stock automatically.

Built for restaurants, cafes, small markets, and warehouse operators.

---

## Monorepo

```
mvp/
  backend/    Express + MongoDB API (plain JavaScript)
  frontend/   Next.js (App Router) + TypeScript dashboard
```

Each app has its own `README.md` with detailed instructions.

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY, TELEGRAM_BOT_TOKEN
npm install
npm run seed               # optional: creates a demo workspace + products
npm run dev
```

The API runs at `http://localhost:4000/api/v1`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev
```

The dashboard runs at `http://localhost:3000`.

Demo login (after running `npm run seed`):

- Email: `demo@inventory.ai`
- Password: `Password123!`

### 3. Telegram bot

1. Create a bot via `@BotFather`, copy the token into `backend/.env` as `TELEGRAM_BOT_TOKEN`.
2. Expose the backend with a tunnel (ngrok / cloud) and set `PUBLIC_BASE_URL`.
3. Call `POST /api/v1/telegram/register-webhook` once authenticated.
4. In Telegram, send `/start` and then `/link <workspaceId>` (find it on the dashboard).
5. Send a voice or text message: _"20 cola arrived today, 5 ayran sold, 2kg meat used"_.

---

## Architecture highlights

### Backend

- Feature-modular: each module has `model / repository / service / controller / routes / validation`.
- Plain JavaScript with strict separation of concerns.
- JWT auth (access + refresh), role-based authorization, Joi validation.
- Centralized `ApiError`, `ApiResponse`, async handler, pagination utilities.
- Winston logger, Helmet, rate-limiting, request logging via Morgan.
- AI pipeline: voice → Whisper → GPT JSON → product matcher → inventory transactions.

### Frontend

- Next.js App Router with `(auth)` and `(dashboard)` route groups.
- Feature-based folder structure with TanStack Query hooks per feature.
- Type-safe API layer (`Axios` + typed `ApiResponse<T>` envelopes).
- ShadCN-style UI primitives built on Radix.
- Auth store (Zustand) + token refresh interceptor.
- Recharts dashboard, loading skeletons, empty states, optimistic invalidations.

---

## MVP features delivered

- [x] Email + password auth (JWT access + refresh)
- [x] Product CRUD (with aliases for voice matching)
- [x] Inventory transactions (in / out / adjust) with audit history
- [x] Voice → text → AI parse → inventory update pipeline
- [x] Telegram bot webhook handler (voice + text)
- [x] Dashboard with KPIs, 14-day trend, top movers, low-stock alerts
- [x] AI assistant playground (text input)
- [x] Low stock alerts on dashboard + per-product flag
- [x] Multi-language voice support (Whisper + GPT)

## Roadmap (future)

- [ ] OCR receipts (vision model)
- [ ] Multi-branch (`branchId` scoping)
- [ ] POS integrations (webhook ingestion)
- [ ] Predictive stock / reorder suggestions
- [ ] Barcode scanning (mobile / camera)
- [ ] Team management UI (invite manager / staff)
- [ ] CSV import / export

---

## Tech stack

**Frontend:** Next.js 16, React 19, TypeScript 5.7 (strict), Tailwind CSS v4 (CSS-first), ShadCN-style UI on Radix, TanStack Query v5, Zustand v5, React Hook Form v7, Zod v4, Recharts.

**Backend:** Node.js 20+, Express 5, MongoDB, Mongoose 8, JWT, Joi, Winston, Helmet 8, OpenAI v6 SDK, Telegram Bot API.

**AI:** OpenAI Whisper (transcription) + GPT (`gpt-4o-mini` by default) for structured inventory extraction.
