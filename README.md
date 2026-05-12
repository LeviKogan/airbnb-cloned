# Stay Victoria (airbnb-cloned)

Next.js 16 app for browsing boutique stays and submitting **direct booking requests**. Listings are static data; bookings persist to **SQLite** via Prisma.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example (Windows PowerShell: `Copy-Item .env.example .env`):

```bash
cp .env.example .env
```

3. Apply database migrations:

```bash
npx prisma migrate dev
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Stack

Next.js (App Router), React 19, Tailwind CSS 4, TypeScript, Prisma + SQLite, Zod.
