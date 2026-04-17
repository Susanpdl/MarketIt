# MarketIt — Influencer Campaign Tracker

Track influencer campaigns, post analytics, and sales growth in one place. Optional **n8n** automation can send outreach emails when you add influencers and update status when replies arrive.

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Auth | JWT |
| Automation | n8n (Docker), workflows in `n8n-workflows/` |

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL**
- **Docker** (optional) — only needed if you use n8n

## Getting started

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment

Copy the example env file and edit values:

```bash
cp .env.example server/.env
```

Set at least `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL`. Optional n8n variables go in the same file (see [Environment variables](#environment-variables)).

### 3. Database

```bash
cd server && npx prisma migrate dev --name init
```

Or, without migration history:

```bash
cd server && npx prisma db push
```

### 4. Run the app

From the repository root:

```bash
npm run dev
```

- **API:** http://localhost:3001  
- **Web app:** http://localhost:3000  

Run processes separately if you prefer:

```bash
npm run dev:server   # API only
npm run dev:client   # Client only
```

The client defaults `NEXT_PUBLIC_API_URL` to `http://localhost:3001` if unset.

---

## n8n setup (optional)

n8n runs in Docker. This repo includes two Compose files:

| File | Use case |
|------|-----------|
| [`docker-compose.yml`](docker-compose.yml) | Local development — n8n on port **5678**, HTTP |
| [`docker-compose.n8n.yml`](docker-compose.n8n.yml) | Production-style — HTTPS `WEBHOOK_URL`, basic auth, UI bound to **127.0.0.1** (put a reverse proxy in front) |

### Local development

1. **Start n8n**

   ```bash
   docker compose up -d
   ```

   Or: `npm run docker:up` (same command).

2. Open **http://localhost:5678** and complete the first-run wizard if prompted.

3. **Import workflows** — In n8n: *Workflows → Import from File*, then add:

   - `n8n-workflows/influencer-outreach.json` — webhook from MarketIt → send email → notify API  
   - `n8n-workflows/influencer-reply-listener.json` — IMAP poll → notify API when someone replies  

4. **Credentials in n8n**

   - **Outreach:** Configure SMTP on the *Send Email* node (or your provider’s email node).  
   - **Reply listener:** Configure IMAP on the *Email Trigger* node so n8n can read the inbox you monitor for replies.

5. **Activate** the outreach workflow and copy its **production webhook URL** (path includes `/webhook/…`). Put that in `server/.env`:

   ```bash
   N8N_WEBHOOK_URL="http://localhost:5678/webhook/influencer-created"
   ```

   Use the exact URL n8n shows for your environment (localhost vs public host).

6. **Shared secret** — Set `N8N_WEBHOOK_SECRET` in `server/.env` to a long random string. In both imported workflows, replace `REPLACE_WITH_N8N_WEBHOOK_SECRET` in the *Authorization* header with that same value (`Bearer <secret>`).

7. **HTTP nodes calling MarketIt** — Workflows include placeholder API URLs (e.g. `https://YOUR-RENDER-API.onrender.com`). Point them at your running API, for example:

   - Same machine, API on the host, n8n in Docker: `http://host.docker.internal:3001/api/webhooks/n8n-email-sent` and `…/n8n-influencer-reply` (Docker Desktop provides `host.docker.internal`).

Restart the API after changing `server/.env`.

### Production-style (HTTPS + basic auth)

1. Copy the example file and fill in values:

   ```bash
   cp .env.n8n.example .env.n8n
   ```

   Set `N8N_PUBLIC_HOST` (no `https://`), `N8N_BASIC_AUTH_USER`, and a strong `N8N_BASIC_AUTH_PASSWORD`. `.env.n8n` is gitignored.

2. Start the stack:

   ```bash
   docker compose -f docker-compose.n8n.yml --env-file .env.n8n up -d
   ```

   The UI listens on **127.0.0.1:5678** only; terminate TLS and route traffic with nginx (or similar) on your `N8N_PUBLIC_HOST` domain.

3. Set `N8N_WEBHOOK_URL` in `server/.env` to the **public** webhook URL n8n shows (must match `WEBHOOK_URL` / host configuration).

---

## Features

- **Influencers** — Organize contacts into Current (replied), Waiting, Past Success, and Past Failure.
- **Email automation** — Adding an influencer with an email can trigger outreach via n8n; reply detection can move them to “replied” when configured.
- **Analytics** — Per-post stats (likes, comments, views); refresh cadence ~30s; manual updates where the Instagram API is limited.
- **Growth** — Sales-over-time chart with markers when influencers post.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and client together |
| `npm run dev:server` | API only |
| `npm run dev:client` | Client only |
| `npm run build` | Build server and client |
| `npm run test` | Run server and client tests |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:migrate` | Create/apply Prisma migrations |
| `npm run docker:up` | Start services in `docker-compose.yml` (includes n8n for local dev) |
| `npm run docker:down` | Stop those Compose services |

## Environment variables

Variables below are read from **`server/.env`** (and `client/.env.local` for `NEXT_PUBLIC_*` if you use one).

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |
| `CLIENT_URL` | Allowed browser origin for CORS (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Public API base URL for the client (default: `http://localhost:3001`) |
| `N8N_WEBHOOK_URL` | Full URL of the n8n **Webhook** trigger for `influencer.created` (optional) |
| `N8N_WEBHOOK_SECRET` | Shared secret; n8n sends `Authorization: Bearer …` to `/api/webhooks/*` (optional but recommended in production) |

For Docker-based n8n with [`docker-compose.n8n.yml`](docker-compose.n8n.yml), see [`.env.n8n.example`](.env.n8n.example).
