# CSCI 411/412: Senior Seminar — Midterm Report

**Student:** Spoudel  
**Course:** CSCI 411/412 — Senior Seminar  
**Project Title:** MarketIt — Influencer Campaign Tracker for Small Businesses  
**Instructor:** Dr. Qi Li  
**Date:** March 12, 2026

---

## 1. Current Progress

### 1.1 Implementation Status

The following modules and features have been completed:

| Module | Status | Description |
|--------|--------|-------------|
| **User Authentication** | ✅ Complete | Register, login, JWT-based session. Auth context with localStorage persistence. |
| **Influencer Management** | ✅ Complete | CRUD operations, status tracking (waiting → active → success/failure), Kanban-style UI. |
| **Post Analytics** | ✅ Complete | Per-influencer post stats (likes, comments, shares, views). Manual entry with 30s refresh. |
| **Sales Growth** | ✅ Complete | Sales-over-time chart (Recharts) with influencer campaign markers. |
| **n8n Email Automation** | ✅ Complete | Webhook trigger on influencer creation; automated outreach emails via SMTP. |
| **Reply Listener** | ✅ Complete | n8n workflow for IMAP polling; webhook callback to update influencer status on reply. |
| **Webhook API** | ✅ Complete | `/api/webhooks/n8n-influencer-reply` and `/api/webhooks/n8n-email-sent` for n8n callbacks. |
| **Automated Tests** | ✅ Complete | Backend: auth, protected routes, health. Frontend: API utilities, InfluencerCard. |
| **Database** | ✅ Complete | PostgreSQL + Prisma. Models: User, Influencer, InfluencerPost, PostStats, SalesRecord. |

**Tech Stack:** Next.js 14 (App Router), Express, TypeScript, Prisma ORM, PostgreSQL, JWT, n8n (Docker), Recharts.

### 1.2 GitHub Repository

**Repository:** [https://github.com/Susanpdl/MarketIt](https://github.com/Susanpdl/MarketIt)

The repository serves as the central record of:
- All source code (client, server, n8n workflows)
- README with setup and run instructions
- `docs/N8N_SETUP.md` for n8n integration
- `PROGRESS_REPORT.md` for ongoing project logs
- `.env.example` for environment variable templates

### 1.3 Development Timeline

| Phase | Planned (from proposal) | Actual Status |
|-------|-------------------------|---------------|
| Project setup & schema | Week 1–2 | ✅ Completed |
| Auth & core API | Week 3–4 | ✅ Completed |
| Influencer CRUD & UI | Week 5–6 | ✅ Completed |
| Analytics & Growth chart | Week 7–8 | ✅ Completed |
| Email automation (n8n) | Post-MVP | ✅ Completed ahead of schedule |
| Deployment | Week 9–10 | 🔄 Pending |
| Polish & final report | Week 11–14 | 🔄 Pending |

**Summary:** Core implementation is ahead of the original schedule. The n8n email automation was added as an enhancement beyond the initial MVP scope. Deployment and production polish remain for the second half of the semester.

---

## 2. Challenges and Proposal Adjustments

### 2.1 Technical Difficulties

#### Challenge 1: n8n Webhook Response Mode

**Problem:** The n8n webhook node returned `500: "The response mode 'immediately' is not valid!"` when MarketIt triggered the workflow.

**Cause:** The workflow JSON used `responseMode: "immediately"`, which is deprecated in newer n8n versions.

**Solution:** Updated the workflow to use `responseMode: "onReceived"`, which is the current valid option for immediate acknowledgment.

#### Challenge 2: SMTP Connection for Outreach Emails

**Problem:** The Send Email node failed with `getaddrinfo ENOTFOUND smpt.gmail.com` and later `SSL routines: wrong version number`.

**Causes:** (1) Typo in host: `smpt.gmail.com` instead of `smtp.gmail.com`. (2) Mismatch between port and security: using SSL on port 587 (which expects STARTTLS).

**Solution:** Corrected host to `smtp.gmail.com`, set port to `587`, and configured STARTTLS (not implicit SSL). Used Gmail App Password for authentication.

#### Challenge 3: Empty Email Body and Raw From Address

**Problem:** Outreach emails arrived with an empty body and the From field showing `{{ $env.N8N_EMAIL_FROM ''}}` instead of the actual address.

**Causes:** (1) Set node expression escaping issues for the body template. (2) `N8N_EMAIL_FROM` was defined at the wrong level in `docker-compose.yml` (root instead of under the n8n service), so the container never received it.

**Solution:** Replaced the Set node with a Code node for reliable body construction. Moved `N8N_EMAIL_FROM` into the n8n service's `environment` block in `docker-compose.yml`.

#### Challenge 4: JWT Auth Without Duplicating Logic (from earlier phase)

**Problem:** 15+ protected endpoints needed JWT verification without duplicating checks in each handler.

**Solution:** Extracted `authMiddleware` and applied it at the router level. Decoded user ID is attached to `req.user` for row-level ownership checks.

#### Challenge 5: Auth State Flash on Page Load

**Problem:** Logged-in users saw a brief flash of the login page on refresh before session was restored from localStorage.

**Solution:** Added a `loading` flag in `AuthProvider` that stays `true` until localStorage is read. Protected pages wait for hydration before deciding to show content or redirect.

### 2.2 Strategic Adjustments

No major changes to the original proposal goals. The project has maintained technical rigor. Enhancements added:

- **n8n integration:** Automated outreach emails and reply detection were added as an extension of the influencer management feature. This aligns with the goal of reducing manual work for small business owners.
- **Webhook API:** New endpoints for n8n callbacks were added without altering the core data model or user flows.

If future scope changes are needed (e.g., dropping Instagram API integration due to Meta’s requirements), a modified proposal would be submitted.

---

## 3. Demonstration of Work Done

### 3.1 Preliminary Results

**System Outputs:**
- Influencer list with status badges (Current, Waiting for reply, Past Success, Past Failure)
- Post analytics table with likes, comments, shares, views per post
- Sales growth line chart with green dashed vertical markers at influencer post dates
- Automated outreach emails sent when an influencer with email is added
- Status updates when n8n detects a reply via IMAP

**User Interface:**
- Login and Register pages with form validation
- Dashboard with navigation to Influencers, Analytics, Growth
- Add Influencer modal (name, Instagram handle, email, notes)
- Influencer cards with status dropdown and “View analytics” link
- Analytics page with influencer selector and post stats
- Growth page with sales chart and campaign markers

**Test Results:**
- Backend: 14 tests passing (auth, protected routes, health)
- Frontend: 7 tests passing (API utilities, InfluencerCard)

### 3.2 Technical Demo

**Live/Recorded Demo Plan:**

1. **Auth flow:** Register a new account, log in, show JWT persistence across refresh.
2. **Influencer management:** Add an influencer with email → n8n sends outreach email → show email in inbox.
3. **Status workflow:** Manually update status (or simulate reply via n8n) → show status change in UI.
4. **Analytics:** Add a post with stats → show analytics page with engagement data.
5. **Growth:** Add sales records → show chart with campaign markers at post dates.

**Core functionality is operational** and ready for a live or recorded demonstration. The app runs locally with `npm run dev`; n8n runs via `docker compose up -d`.

---

## 4. Future Plan for Final Delivery

### 4.1 Technical Milestones (Prioritized)

| Priority | Task | Description |
|----------|------|-------------|
| 1 | **Production deployment** | Deploy frontend (Vercel) and backend + DB (Railway/Render). Configure env vars and CORS. |
| 2 | **n8n production setup** | Deploy n8n or use n8n Cloud; update `N8N_WEBHOOK_URL` for production. |
| 3 | **401 token expiry handling** | Add global interceptor to clear session and redirect to login on 401. |
| 4 | **Influencer search and filtering** | Search by name/handle; filter dashboard by status. |
| 5 | **Export functionality** | CSV or PDF campaign report (influencer performance, revenue impact). |
| 6 | **Account deletion confirmation** | Confirmation dialog before destructive actions. |
| 7 | **Mobile responsiveness** | Verify and improve layouts for small screens. |
| 8 | **Instagram API (optional)** | Investigate Basic Display/Graph API for automatic post stats; keep manual entry as fallback. |

### 4.2 Final Deliverables

| Deliverable | Plan |
|-------------|------|
| **Final written report** | Full technical documentation, architecture, design decisions, test coverage, deployment steps, lessons learned. |
| **GitHub repository** | Polished README, clear folder structure, up-to-date docs, `.env.example`, no sensitive data. |
| **Final video presentation** | Recorded walkthrough of deployed app, key features, demo of n8n automation, and summary of outcomes. |

---

## 5. Professional Conduct and Integrity

### AI Tools and Libraries

- **AI assistance:** Cursor (AI-assisted development) was used for code suggestions, debugging, and documentation. All AI-generated content was reviewed and adapted to fit the project. This report and the use of AI are acknowledged here and in the repository.
- **Open-source libraries:** The project uses open-source dependencies (Next.js, Express, Prisma, Recharts, n8n, etc.) as documented in `package.json` and `server/package.json`. All are used under their respective licenses (MIT, Apache 2.0, etc.).
- **n8n workflows:** Pre-built workflow JSON files (`influencer-outreach.json`, `influencer-reply-listener.json`) are included in the repository and documented in `docs/N8N_SETUP.md`.

---

*This midterm report reflects the state of the MarketIt project as of March 12, 2026.*
