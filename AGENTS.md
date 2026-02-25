# MarketIt - Influencer Campaign Tracker

Full-stack TypeScript app: Next.js 14 frontend (`client/`) + Express backend (`server/`) with PostgreSQL via Prisma ORM.

## Cursor Cloud specific instructions

### Services

| Service | Port | Command |
|---------|------|---------|
| Express API | 3001 | `npm run dev:server` (from root) |
| Next.js UI | 3000 | `npm run dev:client` (from root) |
| Both | 3000+3001 | `npm run dev` (from root, uses concurrently) |

### Prerequisites

- **PostgreSQL** must be running on port 5432. Start with `sudo pg_ctlcluster 16 main start`.
- The database `marketit` must exist with user `marketit`/password `marketit`. Create if missing:
  ```
  sudo -u postgres psql -c "CREATE USER marketit WITH PASSWORD 'marketit';"
  sudo -u postgres psql -c "CREATE DATABASE marketit OWNER marketit;"
  ```
- **Server `.env`** must exist at `server/.env` with at minimum `DATABASE_URL="postgresql://marketit:marketit@localhost:5432/marketit"` and `JWT_SECRET`.
- **Client `.env.local`** at `client/.env.local` should contain `NEXT_PUBLIC_API_URL=http://localhost:3001`.

### Database

- Schema is managed via Prisma. Push schema changes: `cd server && npx prisma db push`.
- Generate Prisma client after schema changes: `cd server && npx prisma generate`.

### Lint / Type-check / Build

- Server TypeScript check: `cd server && npx tsc --noEmit`
- Server build: `npm run build:server`
- Client TypeScript check: `cd client && npx tsc --noEmit`
- Client build: `npm run build:client` (runs `next build`)
- No ESLint config exists in the repo. `next lint` will prompt interactively — avoid running it in CI/automation.

### Gotchas

- The server uses ESM (`"type": "module"` in `server/package.json`). Route imports use `.js` extensions (e.g., `./routes/auth.routes.js`) even though source is `.ts` — this is correct for NodeNext module resolution.
- Growth and analytics API routes are sub-paths (`/api/growth/sales`, `/api/growth/markers`, `/api/analytics/:influencerId`), not root GETs.
- No automated test suite exists in the repo.
