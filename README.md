# MarketIt - Influencer Campaign Tracker

A lightweight app for small businesses to track influencer campaigns, view post analytics, and measure sales growth.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT

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

## Features

1. **Influencers** – Add influencers and organize them into:
   - Current (replied, in the loop)
   - Waiting for reply
   - Past Success (posted as requested)
   - Past Failure (did not reach out or broke)

2. **Analytics** – Per-influencer post stats (likes, comments, views). Stats refresh every 30s. Update manually since Instagram API access is limited.

3. **Growth** – Sales-over-time chart with success markers showing when each influencer posted.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `NEXT_PUBLIC_API_URL` | API base URL (client-side, default: http://localhost:3001) |
