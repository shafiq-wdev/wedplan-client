# WedPlan — Client

> A beautiful, role-based wedding planning marketplace built with Next.js 16, React 19, Tailwind v4, ShadCN/Base UI, Better Auth, Motion, MongoDB, and Stripe.

Couples discover and book wedding services. Vendors publish listings, manage bookings, and upgrade to Premium. Admins moderate users, services, and transactions.

---

## Contents

- [Important features](#important-features)
- [UI design requirements](#ui-design-requirements)
- [Dashboard UI requirements](#dashboard-ui-requirements)
- [Challenge requirements](#challenge-requirements)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Run locally](#run-locally)
- [Scripts](#scripts)
- [Routes](#routes)
- [Auth & security notes](#auth--security-notes)
- [Deployment checklist](#deployment-checklist)
- [Links](#links)

---

## Important features

- Wedding-themed animated homepage with featured services and category exploration
- Public service browsing with advanced search, filters, and price sorting
- Dynamic service detail pages with image gallery, vendor information, and booking form
- Better Auth email/password + Google sign-in with customer, vendor, and admin roles
- Role-aware dashboards with sidebar navigation and statistic cards
- Vendor service CRUD with approval status, availability, and Free/Premium limits
- Customer booking tracking and pending-request cancellation
- Admin user management, service moderation, and transaction overview
- Stripe Checkout with Premium activation only after a verified webhook
- Toasts, inline validation, skeletons, empty states, error states, and confirm dialogs
- Fully responsive layout for desktop, tablet, and mobile

---

## UI design requirements

The full design system is documented in **[`UI-DESIGN-REQUIREMENTS.md`](./UI-DESIGN-REQUIREMENTS.md)**. The dedicated workspace specification is **[`DASHBOARD-UI-REQUIREMENTS.md`](./DASHBOARD-UI-REQUIREMENTS.md)**. Together they cover:

- Responsive wedding-themed interface
- Consistent spacing, typography, and color tokens
- Appropriate ShadCN/Base UI components
- Reusable cards, badges, shells, dialogs, and feedback states
- Motion with reduced-motion support
- Dashboard shell, role-based navigation, statistic cards, role workspaces, and interaction rules

---

## Dashboard UI requirements

The dashboard specification documents the shared shell, customer/vendor/admin workspaces, metrics, responsive behavior, component inventory, feedback rules, and QA checklist in **[`DASHBOARD-UI-REQUIREMENTS.md`](./DASHBOARD-UI-REQUIREMENTS.md)**.

---

## Challenge requirements

The advanced search, price sorting, JWT verification, and MongoDB collection contract are documented in **[`../CHALLENGE-REQUIREMENTS.md`](../CHALLENGE-REQUIREMENTS.md)**. The client-specific pieces are:

| Requirement | Implementation |
| --- | --- |
| Advanced service search | `src/lib/service-query.js` + `ServiceExplorer.jsx` |
| Price sorting | Shared `price_asc` / `price_desc` sort values in the query helper and filter UI |
| JWT issuance | `src/app/api/auth/backend-token/route.js` |
| Business collections | `services`, `bookings`, `transactions`; Better Auth owns auth collections |
| Demo references | `scripts/seed-services.mjs` assigns a real `vendorId` to every seeded service |

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.4.6 App Router with Cache Components |
| UI | React 19, JavaScript/JSX, Tailwind CSS v4 |
| Components | ShadCN `base-nova` style using `@base-ui/react` |
| Animation | `motion/react` |
| Icons | Lucide React |
| Auth | Better Auth with MongoDB adapter |
| Database | MongoDB via the native driver |
| Payments | Stripe Checkout + webhook |
| Images | ImgBB client-side uploads |
| Validation/Linting | ESLint 9 flat config |

---

## Project structure

```text
src/
├── app/
│   ├── api/                 # Better Auth, admin, payments, token routes
│   ├── admin/               # Admin dashboard and management pages
│   ├── customer/dashboard/  # Customer workspace
│   ├── vendor/dashboard/    # Vendor workspace
│   ├── services/            # Browse + dynamic detail pages
│   ├── payments/            # Success and cancel results
│   ├── sign-in/             # Sign-in form
│   ├── sign-up/             # Registration form
│   ├── profile/             # Profile settings
│   ├── error.js             # Route-level error boundary
│   └── not-found.js         # Branded 404 page
├── components/
│   ├── admin/               # User and service managers
│   ├── auth/                # Auth shell and role selector
│   ├── dashboard/           # Shell, sidebar, stats, booking/service managers
│   ├── feedback/            # Loaders, states, confirm dialog, utilities
│   ├── payments/            # Payment result card
│   ├── services/            # Explorer, cards, gallery, booking form
│   └── ui/                  # ShadCN components
└── lib/
    ├── auth.js              # Better Auth server config
    ├── auth-client.js       # Better Auth React client
    ├── roles.js             # Role constants and dashboard paths
    ├── db.js                # Cached MongoDB connection
    ├── services.js          # Service schema source of truth
    ├── dashboard-data.js    # Dashboard serialization helpers
    └── api-client.js        # Safe response parsing + friendly errors
```

---

## Installation

```bash
cd wedplan-client
npm install
cp .env.example .env
```

Fill in every required value in `.env`. See the table below.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Long random secret used by Better Auth |
| `BETTER_AUTH_URL` | Yes | Server-side app origin, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes | Browser-visible auth origin; must match the dev/live origin |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app origin used for redirects and Stripe return URLs |
| `BETTER_AUTH_DB_URI` | Yes | MongoDB connection string shared with the server |
| `BETTER_AUTH_DB_NAME` | No | Database name, default `wedplandb` |
| `JWT_SECRET` | Yes | Must exactly match the Express server secret |
| `JWT_EXPIRES_IN` | No | Backend token lifetime, default `15m` |
| `BACKEND_TOKEN_COOKIE_SECURE` | No | Set `true` in production HTTPS |
| `BACKEND_TOKEN_COOKIE_SAME_SITE` | No | Cookie same-site policy, default `lax` |
| `GOOGLE_CLIENT_ID` | Production | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Production | Google OAuth client secret |
| `ADMIN_SIGNUP_CODE` | Production | Code required for public admin sign-up; unset only for demos |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Yes | Public ImgBB key used for image uploads |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Express API origin, e.g. `http://localhost:5000` |
| `STRIPE_SECRET_KEY` | Payments | Stripe secret key, server-side only |
| `STRIPE_WEBHOOK_SECRET` | Payments | Stripe webhook signing secret |
| `STRIPE_PREMIUM_PRICE_ID` | Payments | Premium recurring/one-time price ID |

> Never commit `.env`. Only `.env.example` belongs in the repository.

---

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Express API should already be running on port `5000`.

Seed the demo marketplace data:

```bash
npm run seed:services
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next dev server with Turbopack |
| `npm run lint` | Run ESLint 9 flat config |
| `npm run build` | Create the production build |
| `npm run seed:services` | Insert/update 9 published demo services |

There is no test or typecheck script. Stop `next dev` before `npm run build` if the build stalls on the shared `.next` directory.

---

## Routes

### Public

`/` · `/services` · `/sign-in` · `/sign-up`

### Authenticated / role-based

`/dashboard` · `/customer/dashboard` · `/vendor/dashboard` · `/admin/dashboard` · `/admin/users` · `/admin/services` · `/admin/transactions` · `/profile` · `/services/[id]` · `/payments/success` · `/payments/cancel`

`/dashboard` redirects to the signed-in user's role dashboard. A user who manually opens another role's dashboard is redirected to their own.

---

## Auth & security notes

- Better Auth sessions include `session.user.role`.
- An httpOnly `wedplan_jwt` cookie is issued by `/api/auth/backend-token` and verified by Express.
- The Express API reloads the user from MongoDB; role and ownership are never trusted from the client.
- Admin sign-up is protected by `ADMIN_SIGNUP_CODE` when configured.
- Profile updates reject protected fields such as `role`, `subscriptionPlan`, and `subscriptionExpiresAt`.
- Premium activation happens only after a verified Stripe webhook event.

### Next.js 16 notes

- Pages reading MongoDB or sessions call `connection()` and export `const instant = false`.
- External images use `next/image` with `unoptimized`.
- Use `preload`, not the deprecated `priority` prop.
- Do not add route-level `loading.js`; it produced stuck fallbacks in this environment. Use component-level feedback instead.

---

## Deployment checklist

- [ ] Set every environment variable on the hosting platform.
- [ ] Match `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL` to the live origin.
- [ ] Use the same `JWT_SECRET` on client and server.
- [ ] Configure Google OAuth callback URLs.
- [ ] Configure the Stripe webhook endpoint and signing secret.
- [ ] Set `BACKEND_TOKEN_COOKIE_SECURE=true`.
- [ ] Run `npm run lint` and `npm run build` successfully.
- [ ] Verify all routes reload without 404/504 errors.

---

## Links

| Item | Link |
| --- | --- |
| Live site | `https://your-deployment.example` |
| Client repository | `https://github.com/your-account/wedplan-client` |
| Server repository | `https://github.com/your-account/wedplan-server` |
| Assignment overview | [`../ASSIGNMENT-9.md`](../ASSIGNMENT-9.md) |
| Challenge requirements | [`../CHALLENGE-REQUIREMENTS.md`](../CHALLENGE-REQUIREMENTS.md) |
| UI design requirements | [`UI-DESIGN-REQUIREMENTS.md`](./UI-DESIGN-REQUIREMENTS.md) |
| Dashboard UI requirements | [`DASHBOARD-UI-REQUIREMENTS.md`](./DASHBOARD-UI-REQUIREMENTS.md) |
