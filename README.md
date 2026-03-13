# MarketIt - Influencer Campaign Tracker

A lightweight app for small businesses to track influencer campaigns, view post analytics, and measure sales growth.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT
- **Automation:** n8n (Docker) for outreach emails and reply detection

## Setup

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Database

Create a PostgreSQL database and set the connection string:

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

Run migrations:

```bash
cd server && npx prisma migrate dev --name init
```

Or push schema without migrations:

```bash
cd server && npx prisma db push
```

### 3. Run the app

From the project root:

```bash
npm run dev
```

This starts:
- **API:** http://localhost:3001
- **Client:** http://localhost:3000

Or run separately:

```bash
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
```

### 4. Email automation (optional)

To send outreach emails when influencers are added and detect replies:

```bash
docker compose up -d    # Starts n8n on http://localhost:5678
```

Then import the workflows from `n8n-workflows/` and configure SMTP. See [n8n Setup](docs/N8N_SETUP.md) for details.

## Features

1. **Influencers** – Add influencers and organize them into:
   - Current (replied, in the loop)
   - Waiting for reply
   - Past Success (posted as requested)
   - Past Failure (did not reach out or broke)

2. **Email automation** – When you add an influencer with an email, n8n can automatically send a partnership outreach email. Optionally poll your inbox to detect replies and update status.

3. **Analytics** – Per-influencer post stats (likes, comments, views). Stats refresh every 30s. Update manually since Instagram API access is limited.

4. **Growth** – Sales-over-time chart with success markers showing when each influencer posted.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + client concurrently |
| `npm run build` | Build server and client |
| `npm run test` | Run server and client tests |
| `npm run db:push` | Push Prisma schema to database |
| `npm run docker:up` | Start n8n via Docker Compose |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `NEXT_PUBLIC_API_URL` | API base URL (client-side, default: http://localhost:3001) |
| `N8N_WEBHOOK_URL` | n8n webhook URL for influencer-created events (server) |
| `N8N_WEBHOOK_SECRET` | Secret for n8n callback authentication (server) |

## Documentation

- [n8n Setup](docs/N8N_SETUP.md) — Email automation with n8n
- [Midterm Report](docs/MIDTERM_REPORT.md) — CSCI 411/412 Senior Seminar midterm assessment
