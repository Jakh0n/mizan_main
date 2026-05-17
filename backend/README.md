# Inventory SaaS — Backend

Production-grade Express.js API for an AI-powered inventory management platform.

## Tech

- **Node.js 20+** with native `--watch` mode (no nodemon)
- **Express 5** (latest stable)
- **MongoDB + Mongoose 8**
- **OpenAI v6 SDK** (Whisper + GPT)
- **Telegram Bot API**
- **JWT auth** (access + refresh), **Joi** validation, **Winston** logging
- **bcryptjs 3**, **Helmet 8**, **express-rate-limit 8**

## Architecture

Feature-based, controller / service / repository pattern.

```
src/
  config/        env + db connection
  constants/     enums shared across modules
  middleware/    auth, validate, errors, rate-limit, logger
  modules/
    auth/        register, login, refresh, me
    users/       user + workspace models, repositories
    products/    products CRUD
    inventory/   transactions (in/out/adjust) + history
    ai/          OpenAI client + Whisper transcription + GPT parser
    telegram/    Telegram webhook + voice flow
    analytics/   dashboard stats, trends, top products, low stock
  routes/        composes module routers under /api/v1
  utils/         ApiError, ApiResponse, logger, pagination, asyncHandler
  scripts/       seed script
  app.js         Express app factory
  server.js      bootstrap, DB, graceful shutdown
```

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Optional: seed a demo workspace + products:

```bash
npm run seed
```

Login: `demo@inventory.ai` / `Password123!`

## API

Base path: `/api/v1`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET  /auth/me`

### Products
- `GET    /products` (search, pagination, low-stock filter)
- `POST   /products`
- `GET    /products/:id`
- `PATCH  /products/:id`
- `DELETE /products/:id`

### Inventory
- `GET  /inventory/transactions`
- `POST /inventory/transactions` (manual add/remove/adjust)

### AI
- `POST /ai/parse-text` — parse a typed message and apply inventory changes

### Telegram
- `POST /telegram/webhook` — Telegram update webhook (secret-token protected)
- `POST /telegram/register-webhook` — register the bot webhook

### Analytics
- `GET /analytics/overview`
- `GET /analytics/trend?days=14`
- `GET /analytics/top-products?type=out&days=30&limit=5`
- `GET /analytics/low-stock`

## AI Flow

1. Telegram → webhook receives voice message
2. Backend downloads audio from Telegram
3. Whisper transcribes audio → text
4. GPT parses text → structured `{ items: [{ product, type, quantity, unit, note }] }`
5. Each item is matched to a product (name + aliases + fuzzy search)
6. Matched items create `InventoryTransaction` records and adjust product stock
7. Bot replies with a summary (recognized / unresolved)

## Future Extensions

- OCR receipts (vision model)
- Multi-branch (additional `branchId` scoping)
- POS webhooks
- Predictive stock (forecast service)
- Barcode scanning
