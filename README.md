# KnowVa — Academic Resource Platform

Full-stack academic notes platform with three role experiences built on one backend, one database and one design
system: **Student portal**, **Lecturer portal** and **Super Admin dashboard**, plus a public marketing + discovery site.

## Stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS v4 (dark/light, persisted)
- PostgreSQL via Drizzle ORM (`src/db/schema.ts`)
- Auth: bcrypt password hashing + opaque session cookies (`httpOnly`, `SameSite=Lax`, `Secure` in production)
- Files: uploaded to a private `STORAGE_DIR` (outside the web root), served only through authorized routes
- Payments: Stripe Checkout + signed webhooks, with a development-only fake checkout
- Email: SMTP through nodemailer; when SMTP is not configured, links are printed to the server log

## Run it
Clone and configure first (`.env` is intentionally not committed):

```bash
cp .env.example .env    # then set DATABASE_URL for your machine
npm install
npx drizzle-kit push --force    # create/refresh tables
node scripts/seed.js             # demo data + accounts
npm run dev                      # or: npm run build && npm run start
```

Seeded accounts:

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@knowva.app` | `Admin@12345` |
| Lecturer | `lecturer@knowva.app` | `Lecturer@123` |
| Student | `student@knowva.app` | `Student@123` |

## Routes
- Public: `/`, `/explore`, `/explore/[id]`, `/pricing`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
- Student: `/student/{dashboard,explore,my-notes,bookmarks,recently-viewed,private-notes,premium,profile,settings}`
- Lecturer: `/lecturer/{dashboard,resources,upload,reviews,explore,bookmarks,private-notes,premium,profile,settings}`
- Super admin: `/superadmin/{dashboard,approvals,resources,reports,users,academic-structure,subscriptions,audit-logs,settings,explore,private-notes,profile}`

## Tests
```bash
python3 scripts/api-smoke.py     # run against a started server (localhost:3000)
```
28 checks covering registration, login, session handling, RBAC (student blocked from lecturer/admin APIs, no
superadmin at signup, no lecturer self-approval), moderation (pending → approved/rejected with required reason,
hidden from students until approved), file upload validation, private-note isolation, report → takedown, password
reset token rejection, audit logging, and **6 concurrent premium downloads from a free account → exactly 3 succeed**.

## Environment
```
DATABASE_URL=...
SESSION_COOKIE_NAME=knowva_session
FREE_MONTHLY_PREMIUM_DOWNLOADS=3
STORAGE_DIR=./storage
STRIPE_SECRET_KEY=sk_test_...      # optional
STRIPE_PRICE_ID=price_...          # optional
STRIPE_WEBHOOK_SECRET=whsec_...    # optional
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= SMTP_FROM=   # optional
```

## Security model (enforced server-side, never by hiding buttons)
- Every protected API route re-reads the session and checks the role (`requireUser` / `requireRole`).
- Download entitlement is decided inside a DB transaction with `pg_advisory_xact_lock(userId)`, so parallel
  requests and direct URL access cannot bypass the monthly free limit.
- Lecturer uploads always start `pending`; only superadmins may change status, and rejection needs a reason.
- File uploads are limited by size (30MB) and MIME type; files are stored with generated names and read back only
  through the authorized download route (path is normalized, traversal-safe).
- Password hashes, verification tokens and reset tokens are never returned by any API.
- Audit log records role changes, suspensions, moderation decisions, structure changes and settings changes with
  actor + timestamp (no secrets, no tokens).
- The last active superadmin cannot be demoted or suspended.
- Fake checkout is refused when `NODE_ENV=production`.

## Honest status / not yet built
- **Stripe**: verified only through local logic and signature-checked webhook handling. Run one real test-mode
  checkout + `stripe listen` webhook before going live.
- **Email**: without SMTP, verification and reset links appear in the server log — never claim delivery.
- No in-browser PDF viewer (secure authorized downloads instead), no M-Pesa, no push/in-app notifications,
  no public lecturer profile pages beyond uploader attribution, legal page text still to be written.
- `FREE_MONTHLY_PREMIUM_DOWNLOADS` changed in the admin UI is in-process only until redeployed via env var.

## Brand
The KnowVa mark is a single glyph that reads three ways: a **K**, an **open book seen from the spine**, and a
**verification check** — knowledge plus moderation. It ships as inline SVG (`src/components/brand-mark.tsx`) so it
stays sharp from a 16px favicon to a 96px hero, with `gradient` / `badge` / `light` / `mono` tones and a `KnowVa`
wordmark that gradients only the “Va”. The same component set powers the marketing nav, footer, auth screens and the
portal sidebar (which collapses to the mark alone). Files: `src/app/icon.svg` (favicon) and
`src/app/opengraph-image.tsx` (1200×630 social card).

## Deploy (Linux VPS, Nginx + PM2)
1. `npm ci && npm run build`
2. Apply schema **non-destructively** and back up first:
   `pg_dump $DATABASE_URL > backup-$(date +%F).sql` then `npx drizzle-kit push`
3. Point PM2 at `npm run start`, give the app write access to `STORAGE_DIR`, and **never** run the seed script on production.
4. Nginx: proxy `/` to the Node port, set `client_max_body_size 32m;`, enable HTTPS, proxy the session cookie as-is.
5. Set production env vars (`NODE_ENV=production`, real Stripe keys, SMTP) and register the webhook URL
   `/api/billing/webhook` in the Stripe dashboard.
6. Rollback: `pm2 stop knowva`, restore the previous build directory, `psql app_db < backup-<date>.sql` only if a
   migration must be reverted, then `pm2 start knowva`.
