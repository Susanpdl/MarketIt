# MarketIt — Project Progress Report

**Student:** Spoudel  
**Course:** CSCI 411/412 — Senior Seminar 2  
**Project Title:** MarketIt — Influencer Campaign Tracker for Small Businesses  
**GitHub Repository:** *(add your GitHub link here)*  
**Last Updated:** February 25, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Illustrations](#2-design-illustrations)
3. [Implementation and Sample Code](#3-implementation-and-sample-code)
4. [GitHub Repository](#4-github-repository)
5. [Initial Results and Testing](#5-initial-results-and-testing)
6. [Challenges and Solutions](#6-challenges-and-solutions)
7. [Next Steps](#7-next-steps)

---

## 1. Project Overview

### Project Goal

**MarketIt** is a full-stack web application that helps small businesses manage and track their influencer marketing campaigns from a single, organized dashboard. The goal is to give business owners a centralized tool to monitor every stage of an influencer relationship — from first contact to post-campaign analytics — and to visualize whether those campaigns are actually driving sales growth.

### The Problem It Solves

Small businesses running influencer marketing campaigns typically manage everything through spreadsheets, direct messages, and email threads, with no unified view of performance. This creates several pain points:

- It is hard to know which influencers have been contacted, which have replied, and which have actually posted
- There is no easy way to track engagement metrics (likes, comments, shares, views) per post
- It is difficult to measure whether an influencer campaign actually drove revenue growth
- Without data, future partnership decisions are based on guesswork rather than evidence

MarketIt directly addresses these problems by providing a purpose-built dashboard that centralizes influencer tracking, post analytics, and sales growth visualization in one place.

### Intended Users

The primary users are **small business owners** who use Instagram influencer marketing as part of their growth strategy but do not have the resources to use enterprise-level marketing platforms. A typical user would manage a handful to a few dozen influencer relationships at a time.

### Current Development Stage

The core application is functionally complete. All major features have been implemented: user authentication, influencer management with status tracking, post analytics, and sales growth visualization with a chart. Automated tests have been written for the API layer and key frontend components. The application runs successfully in a local development environment. The remaining work is deployment to a production environment.

---

## 2. Design Illustrations

### Figure 1 — System Architecture Diagram

**What it represents:** This diagram shows the three-tier architecture of MarketIt: the Next.js frontend (client), the Express REST API (server), and the PostgreSQL database. It illustrates how the three layers communicate and what responsibilities each layer holds.

**How it supports the system design:** The separation into three distinct tiers keeps concerns isolated. The frontend is responsible for UI and state management. The backend handles business logic, authentication, and data access. The database stores all persistent data. This separation makes each tier independently testable and replaceable.

```
┌────────────────────────────────────┐
│           Next.js Frontend         │
│  (App Router, React, TypeScript)   │
│                                    │
│  Pages: Login | Register           │
│         Influencers | Analytics    │
│         Growth                     │
└────────────────┬───────────────────┘
                 │ HTTP REST API
                 │ JWT in Authorization header
┌────────────────▼───────────────────┐
│        Express REST Backend        │
│  (Node.js, TypeScript)             │
│                                    │
│  Routes → Services → Prisma ORM   │
└────────────────┬───────────────────┘
                 │
┌────────────────▼───────────────────┐
│          PostgreSQL Database       │
│  (Users, Influencers, Posts,       │
│   PostStats, SalesRecords)         │
└────────────────────────────────────┘
```

---

### Figure 2 — Application Flowchart

**What it represents:** This flowchart traces the full path a user takes through the application — from first visiting the app, through authentication, and into each of the three core dashboard sections.

**How it supports the system design:** It makes explicit the authentication gate that sits between the public-facing pages and the protected dashboard. It also shows how the three main features (Influencer Management, Analytics, Growth) are peers on the dashboard, each with their own sub-flows.

```
                        ┌─────────────┐
                        │    Start    │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │  Visit App  │
                        └──────┬──────┘
                               │
                    ┌──────────▼──────────┐
                    │   Has an Account?   │
                    └──────┬──────────────┘
              No           │          Yes
     ┌────────▼──────┐     │     ┌────▼────────────┐
     │  Register     │     │     │  Login Page     │
     │  (email +     │     │     │  (email +       │
     │   password)   │     │     │   password)     │
     └────────┬──────┘     │     └────┬────────────┘
              │            │          │
              └────────────┴──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  JWT Token Issued   │
                    │  (stored in        │
                    │   localStorage)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Dashboard      │
                    │  (Influencers Page) │
                    └──────┬──────────────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼─────┐
   │  Influencer │  │  Analytics  │  │   Growth    │
   │  Management │  │    Page     │  │    Page     │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │ Add / View  │  │ Select an   │  │  Add Sales  │
   │ Influencers │  │ Influencer  │  │  Records    │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │ Update      │  │ View / Edit │  │ View Sales  │
   │ Status:     │  │ Post Stats  │  │ Growth      │
   │  active     │  │ (likes,     │  │ Line Chart  │
   │  waiting    │  │  comments,  │  │ + Campaign  │
   │  success    │  │  shares,    │  │  Markers    │
   │  failure    │  │  views)     │  └─────────────┘
   └─────────────┘  └─────────────┘
```

---

### Figure 3 — Request Lifecycle Diagram

**What it represents:** This sequence diagram shows what happens during a single authenticated API request — the path from the frontend through JWT validation, route handling, the service layer, and the database, and back.

**How it supports the system design:** It highlights the `authMiddleware` as the security gate on every protected route, and shows the layered backend architecture (route → service → Prisma) that keeps database logic separated from HTTP handling.

```
  Frontend                  Backend                  Database
     │                         │                         │
     │── API Request ─────────>│                         │
     │   (+ JWT header)        │                         │
     │                         │                         │
     │                    ┌────▼──────────────┐          │
     │                    │  authMiddleware   │          │
     │                    │  Verifies JWT     │          │
     │                    │  → 401 if invalid │          │
     │                    └────┬──────────────┘          │
     │                         │                         │
     │                    ┌────▼────┐                    │
     │                    │ Route   │                    │
     │                    │ Handler │                    │
     │                    └────┬────┘                    │
     │                         │                         │
     │                    ┌────▼────┐                    │
     │                    │ Service │                    │
     │                    │  Layer  │                    │
     │                    └────┬────┘                    │
     │                         │                         │
     │                         │── Prisma Query ────────>│
     │                         │<─ Result ───────────────│
     │                         │                         │
     │<── JSON Response ───────│                         │
     │                         │                         │
```

---

### Figure 4 — Database Schema (Entity-Relationship)

**What it represents:** This diagram shows all five database entities and the relationships between them as defined in the Prisma schema.

**How it supports the system design:** The schema is designed around user ownership — every piece of data (influencers, sales records) belongs to a specific `User`, which enforces data isolation between accounts. The cascade delete rules ensure that removing a `User` cleans up all their associated data automatically.

```
┌──────────────────┐         ┌────────────────────────┐
│      User        │         │      Influencer         │
│──────────────────│         │────────────────────────│
│ id (PK, cuid)    │1      N │ id (PK, cuid)           │
│ email (unique)   ├─────────┤ userId (FK → User)      │
│ passwordHash     │         │ name                    │
│ name?            │         │ instagramHandle?        │
│ createdAt        │         │ email?                  │
└──────────────────┘         │ notes?                  │
         │                   │ status (enum)           │
         │ 1               N │ addedAt                 │
         │                   │ repliedAt?              │
┌────────▼─────────┐         │ completedAt?            │
│   SalesRecord    │         └────────────┬────────────┘
│──────────────────│                      │ 1
│ id (PK, cuid)    │                      │
│ userId (FK)      │                      │ N
│ amount (Decimal) │         ┌────────────▼────────────┐
│ date             │         │    InfluencerPost        │
│ notes?           │         │────────────────────────│
└──────────────────┘         │ id (PK, cuid)           │
                             │ influencerId (FK)       │
                             │ postUrl?                │
                             │ postedAt?               │
                             └────────────┬────────────┘
                                          │ 1
                                          │
                                          │ 1
                             ┌────────────▼────────────┐
                             │       PostStats          │
                             │────────────────────────│
                             │ id (PK, cuid)           │
                             │ postId (FK, unique)     │
                             │ likes                   │
                             │ comments                │
                             │ shares?                 │
                             │ views?                  │
                             │ fetchedAt               │
                             └─────────────────────────┘
```

---

## 3. Implementation and Sample Code

### Snippet 1 — JWT Authentication Middleware (`server/src/middleware/auth.middleware.ts`)

**Purpose:** This middleware runs before every protected API route. It reads the JWT from the `Authorization: Bearer <token>` header, verifies it using the server's secret, and attaches the decoded user payload to the request object so downstream handlers know who is making the request.

**How it fits:** All dashboard routes (influencers, analytics, growth, sales) are wrapped with this middleware. If the token is missing or invalid, the middleware immediately returns a `401 Unauthorized` response and the route handler never executes.

**Design decision:** Rather than checking authentication inside each route handler, the middleware keeps auth logic in one place and makes it declarative — you apply it at the router level. This follows the single-responsibility principle and avoids duplicating the check across 15+ endpoints.

```typescript
export function authMiddleware(
  req: Request & { user?: AuthPayload },
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;  // attach decoded payload for route handlers
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

---

### Snippet 2 — Auth Service: Register and Login (`server/src/services/auth.service.ts`)

**Purpose:** This service handles the two authentication flows. `register` checks for duplicate emails, hashes the password with bcrypt (10 salt rounds), and creates a new user. `login` fetches the user by email, compares the submitted password against the stored hash, and returns a signed JWT on success.

**How it fits:** This is the business logic layer. The route handlers call these functions and are responsible only for HTTP-level concerns (reading the request body, sending the response). All database interaction and security logic lives here.

**Design decision:** The error messages for login are intentionally generic (`"Invalid credentials"` for both wrong email and wrong password). This prevents user enumeration attacks, where an attacker could distinguish between "email not found" and "wrong password" to probe which accounts exist.

```typescript
export async function register(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token: sign(user.id, user.email),
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token: sign(user.id, user.email),
  };
}
```

---

### Snippet 3 — Influencer Status Update (`server/src/services/influencer.service.ts`)

**Purpose:** This function updates an influencer's campaign status and automatically sets the appropriate timestamp alongside it. When status changes to `active`, the `repliedAt` timestamp is recorded. When it changes to `success` or `failure`, the `completedAt` timestamp is recorded.

**How it fits:** This is the core business logic for the Kanban-style status workflow. The status progression (`waiting → active → success/failure`) represents the real-world lifecycle of an influencer relationship.

**Design decision:** Timestamps are set server-side rather than accepted from the client. This ensures the timestamps are always accurate and cannot be manipulated by the user sending arbitrary dates.

```typescript
export async function updateStatus(
  id: string,
  userId: string,
  status: InfluencerStatus
) {
  const data: Record<string, unknown> = { status };

  // automatically record the timestamp for each status milestone
  if (status === "active") data.repliedAt = new Date();
  if (status === "success" || status === "failure") data.completedAt = new Date();

  return prisma.influencer.updateMany({
    where: { id, userId },  // userId check prevents cross-user updates
    data: data as { status: string; repliedAt?: Date; completedAt?: Date },
  });
}
```

---

### Snippet 4 — Frontend Auth Context (`client/lib/auth.tsx`)

**Purpose:** This React context provides authentication state and actions (`login`, `register`, `logout`) to the entire frontend application. It also persists the JWT token and user object to `localStorage` so the session survives page refreshes.

**How it fits:** The `AuthProvider` wraps the root layout, making `useAuth()` available on every page. Protected pages check `user` and `loading` from this context and redirect to `/login` if no session is present.

**Design decision:** On first load, the `useEffect` reads from `localStorage` before setting `loading = false`. This prevents a flash of the login page for users who are already authenticated — the app waits until it knows the auth state before rendering.

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // rehydrate session from localStorage on page load
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ...register and logout follow the same pattern
}
```

---

### Snippet 5 — Sales Growth Chart with Influencer Markers (`client/app/(dashboard)/growth/page.tsx`)

**Purpose:** This component fetches both sales data and influencer campaign markers in parallel, then renders a `LineChart` using Recharts. For each influencer who has a `success` status and a post date, a vertical `ReferenceLine` (dashed, in green) is drawn on the chart at the corresponding date.

**How it fits:** This is the key data visualization feature of the app. It lets the business owner visually correlate spikes in revenue with the dates that specific influencers posted, making it easy to see which campaigns had an impact.

**Design decision:** `Promise.all` is used to fetch sales and markers simultaneously rather than sequentially, which cuts the load time for this page roughly in half since both requests can be made in parallel.

```typescript
// fetch both datasets simultaneously
const [salesRes, markersRes] = await Promise.all([
  fetch(`${API_URL}/api/growth/sales`, { headers }),
  fetch(`${API_URL}/api/growth/markers`, { headers }),
]);

// in the JSX — draw a vertical marker for each influencer campaign
{markers.map((m) => (
  <ReferenceLine
    key={m.date + m.influencerName}
    x={m.date}
    stroke="#4ade80"           // green dashed line
    strokeDasharray="3 3"
    label={{
      value: m.influencerName,
      position: "top",
      fill: "#4ade80",
      fontSize: 10,
    }}
  />
))}
```

---

## 4. GitHub Repository

> **Repository Link:** *(add your GitHub URL here)*

### Repository Structure

```
MarketIt/
├── client/                    # Next.js 14 frontend (App Router)
│   ├── app/
│   │   ├── (auth)/            # Public pages: login, register
│   │   ├── (dashboard)/       # Protected pages: influencers, analytics, growth
│   │   └── layout.tsx         # Root layout with AuthProvider
│   ├── components/
│   │   └── influencers/       # InfluencerCard, InfluencerBlocks, AddInfluencerModal
│   └── lib/
│       ├── auth.tsx            # Auth context and useAuth hook
│       └── api.ts             # Shared API fetch utilities
│
├── server/                    # Express REST API
│   ├── src/
│   │   ├── routes/            # HTTP route definitions (auth, influencer, analytics, growth, sales)
│   │   ├── services/          # Business logic layer
│   │   ├── middleware/        # JWT auth middleware
│   │   └── __tests__/        # API and integration tests (Vitest)
│   └── prisma/
│       └── schema.prisma      # PostgreSQL schema (Prisma ORM)
│
├── .env.example               # Environment variable template
├── README.md                  # Setup and run instructions
└── package.json               # Root orchestrator (npm workspaces)
```

### Commit History

The repository contains a meaningful commit history reflecting the incremental development of each feature. *(Include a screenshot of the GitHub commit history here before submission.)*

Key commit milestones include:
- Initial project scaffold (monorepo setup, tsconfig, dependencies)
- Database schema and Prisma configuration
- Authentication routes and JWT middleware
- Influencer CRUD and status update service
- Post analytics routes and frontend page
- Sales growth chart with Recharts and campaign markers
- Frontend UI polish (dark theme, modals, navigation)
- Automated tests for API routes and components

---

## 5. Initial Results and Testing

### Test Suite

The project includes automated tests for both the backend and frontend, which are all currently passing.

**Backend Tests (Vitest + Supertest)**

| Test File | Scenarios Covered |
|-----------|------------------|
| `health.test.ts` | `GET /api/health` returns 200 |
| `auth.api.test.ts` | Register: missing fields → 400; duplicate email → 400; success → 200 with token. Login: missing fields → 400; wrong credentials → 401; success → 200 with token |
| `protected-routes.test.ts` | Request with no token → 401; request with invalid token → 401; request with valid token → passes through |

**Sample test output (auth.api.test.ts):**
```
✓ POST /api/auth/register > returns 400 when email and password are missing
✓ POST /api/auth/register > returns 400 when email is missing
✓ POST /api/auth/register > returns 400 when password is missing
✓ POST /api/auth/register > returns 200 with user and token on success
✓ POST /api/auth/register > returns 400 when service throws (duplicate email)
✓ POST /api/auth/login > returns 400 when email and password are missing
✓ POST /api/auth/login > returns 200 with user and token on success
✓ POST /api/auth/login > returns 401 when credentials are invalid
```

**Frontend Tests (Jest + React Testing Library)**

| Test File | Scenarios Covered |
|-----------|------------------|
| `api.test.ts` | API utility functions call the correct endpoints |
| `InfluencerCard.test.tsx` | Card renders influencer name, handle, and status correctly |

### What the Results Show

The tests confirm that:
- Input validation is working correctly on all auth endpoints
- The JWT middleware correctly rejects unauthenticated and tampered requests
- The auth service correctly handles duplicate registration attempts
- Core frontend components render the expected content

### What the System Does in Practice

The application runs correctly end-to-end in local development. A user can register an account, log in, add influencers, track them through each status stage, log post analytics, add sales data, and view the growth chart with campaign markers overlaid. All data is correctly persisted to the PostgreSQL database and isolated per user account.

### What Still Needs Improvement

- Manual stats entry (Instagram post engagement data must be typed in by hand rather than fetched automatically from the Instagram API)
- No mobile-specific testing has been done yet; some layouts may not be fully optimized for small screens
- Deployment to a public URL is still pending, so the app cannot be shared or demoed without running it locally

---

## 6. Challenges and Solutions

### Challenge 1 — Securing the API Without Duplicating Logic

**What was the problem:** Every dashboard endpoint needed to be protected so that one user could not access another user's data. The naive approach would be to check the JWT inside each route handler individually.

**Why it was difficult:** With 15+ protected endpoints spread across 5 route files, duplicating the auth check in each handler would create a large amount of repetitive boilerplate. It would also be error-prone — missing the check on even one route would be a security vulnerability.

**Solution attempted:** The auth check was extracted into a reusable Express middleware function (`authMiddleware`). The middleware is applied at the router level, so all routes in that router are automatically protected.

**What worked:** The middleware approach worked well. A single function in `auth.middleware.ts` handles all JWT verification. Applying it to a router with one line (`router.use(authMiddleware)`) protects every route in that file. The decoded user ID is attached to `req.user` so services can enforce row-level ownership (`where: { id, userId }`).

---

### Challenge 2 — Managing Two TypeScript Configurations in One Monorepo

**What was the problem:** The server uses Node.js-style ES modules with `NodeNext` module resolution (required for Prisma and `tsx`), while the client uses Next.js's bundler-based module resolution. These two configurations are fundamentally incompatible if shared.

**Why it was difficult:** TypeScript configuration errors in a monorepo are subtle — the code may appear to compile but fail at runtime with module resolution errors, especially around `.js` extension imports required by `NodeNext`.

**Solution attempted:** Separate `tsconfig.json` files were created for the server and client, each tuned to their respective runtimes. The root-level `package.json` uses npm workspaces so each sub-package manages its own dependencies and build independently.

**What worked:** Keeping the configurations entirely separate resolved all module resolution issues. The server's `tsconfig` targets `ES2022` with `NodeNext` modules, and the client's `tsconfig` uses `ES2017` with the Next.js plugin.

---

### Challenge 3 — Visualizing Campaign Impact on Revenue

**What was the problem:** Showing that an influencer campaign caused a sales spike requires correlating two different data series — sales records (time series) and influencer post dates — in a single chart.

**Why it was difficult:** Standard chart libraries render one dataset at a time. Overlaying a second layer (the campaign markers) with meaningful labels, without cluttering the chart, required custom chart configuration.

**Solution attempted:** Recharts' `ReferenceLine` component was used to draw vertical dashed lines at the x-axis position corresponding to each influencer's post date. These lines are rendered on top of the existing `LineChart` and labeled with the influencer's name.

**What worked:** The `ReferenceLine` approach works well. The markers render cleanly over the sales line in a distinct color (green), making it visually intuitive. The markers data is fetched from a dedicated `/api/growth/markers` endpoint that queries influencers with `status = success` and a `postedAt` date.

---

### Challenge 4 — Preventing Auth State Flash on Page Load

**What was the problem:** When a logged-in user refreshed the page, the app briefly showed the login page before restoring the session from `localStorage`, causing a visible flicker.

**Why it was difficult:** React's state initializes as empty on every page load. The `localStorage` read happens in a `useEffect`, which runs after the first render — so there is a brief window where `user` is `null` and the app thinks no one is logged in.

**Solution attempted:** A `loading` flag was added to the `AuthProvider`. Its initial value is `true`, and it is only set to `false` after the `useEffect` reads from `localStorage`. Protected pages render nothing (or a neutral loading state) while `loading` is `true`, avoiding any redirect until the auth state is fully known.

**What worked:** This fully resolved the flicker. The protected pages now wait for the auth context to hydrate before deciding whether to show content or redirect to login.

---

## 7. Next Steps

### Remaining Implementation

- [ ] **Deploy to production** — Frontend to Vercel; backend and PostgreSQL database to Railway or Render. This is the most immediate priority.
- [ ] **Influencer search and filtering** — Allow users to search by name or handle, and filter the dashboard view by status.
- [ ] **Export functionality** — Generate a CSV or PDF campaign report summarizing influencer performance and revenue impact.
- [ ] **Instagram API integration** — Explore Instagram's Basic Display API or Graph API to fetch post engagement stats automatically instead of requiring manual entry.
- [ ] **Email reminders** — Send a notification when an influencer in `waiting` status has not responded after a configurable number of days.

### Development Plan for Next Phase

The immediate next phase is deployment. Once the application is accessible via a public URL, it can be shared for real user testing and feedback. After deployment, the focus will shift to usability improvements (search, filtering) before exploring API integrations for automatic stats fetching.

### Anticipated Risks and Concerns

| Risk | Concern | Mitigation |
|------|---------|------------|
| Instagram API access | Meta's API requires app review and has strict rate limits | Investigate API requirements early; keep manual entry as a fallback |
| Database hosting costs | Free-tier PostgreSQL on Railway/Render has row limits | Monitor usage; evaluate scaling needs after initial deployment |
| JWT token expiry handling | The frontend currently does not detect when a stored token has expired until an API call returns 401 | Add a global 401 interceptor that clears the session and redirects to login |
| Data loss on account deletion | Cascade deletes are set up in Prisma, but there is no confirmation step in the UI | Add a confirmation dialog before any destructive action |

---

*This report is updated continuously as the project progresses.*
