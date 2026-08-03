# Stay Victoria (airbnb-cloned)

Next.js 16 property-booking platform with customer accounts, host administration, selectable availability calendars, Stripe payments, and transactional email.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example (Windows PowerShell: `Copy-Item .env.example .env`):

```bash
cp .env.example .env
```

3. Configure Google, Stripe, and Resend using [docs/integrations.md](docs/integrations.md).

4. Apply database migrations:

```bash
npx prisma migrate deploy
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The host workspace is at `/admin`; customer accounts are at `/account`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (domain date / overlap logic) |

## Documentation

- [docs/architecture.md](docs/architecture.md) — data flow and conventions
- [docs/adr/](docs/adr/) — architecture decision records
- [docs/features/](docs/features/) — acceptance criteria per feature slice

Additional provider setup: [docs/integrations.md](docs/integrations.md).

## Stack

Next.js (App Router), React 19, Tailwind CSS 4, TypeScript, Auth.js, Stripe, Prisma + SQLite, and Zod.
