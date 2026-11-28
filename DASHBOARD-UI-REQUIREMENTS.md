# Dashboard UI Requirements

> **Workspace intent:** one consistent shell, three role-aware workspaces, and zero room for cross-role confusion. The visual foundation is shared; navigation, metrics, and actions are determined by the authenticated role and verified again on the server.

---

## Contents

1. [Shared dashboard shell](#1-shared-dashboard-shell)
2. [Role-based navigation map](#2-role-based-navigation-map)
3. [Statistics cards](#3-statistics-cards)
4. [Customer dashboard](#4-customer-dashboard)
5. [Vendor dashboard](#5-vendor-dashboard)
6. [Admin dashboard](#6-admin-dashboard)
7. [Responsive behavior](#7-responsive-behavior)
8. [Visual system](#8-visual-system)
9. [Feedback & interaction rules](#9-feedback--interaction-rules)
10. [Component inventory](#10-component-inventory)
11. [QA checklist](#11-qa-checklist)

---

## 1. Shared dashboard shell

Every private workspace is built from the same two-part layout. Only the links, data, and actions change.

| Element | Requirement | WedPlan implementation |
| --- | --- | --- |
| **Sidebar navigation** | Dedicated dashboard layout with sidebar navigation | `DashboardShell` + `DashboardSidebar`. Fixed 260px rose-tinted rail on desktop with brand, role label, active pill indicator, workspace links, profile settings, and back-to-website link. |
| **Main content area** | Dedicated main content area | Page header (eyebrow, title, description, primary action), metric row, and content panels. Responsive padding and max width keep long tables readable. |
| **Responsive layout** | Responsive on desktop, tablet, and mobile | Desktop: full sidebar + 3–4 column grids. Tablet: collapsible navigation + 2-column cards. Mobile: stacked cards, full-width dialogs, off-canvas navigation. |
| **Role-based navigation** | Navigation based on the authenticated user's role | `linksByRole` in `DashboardSidebar`. Cross-role links are never rendered; direct URL access is redirected by `requirePageAccess` / `requireAdminPage`. |
| **Statistics cards** | Statistics cards with consistent theme | `StatCard` pairs a bold value, short label, contextual hint, and icon in a rose-bordered white card. |
| **Consistent theme** | Consistent theme across dashboards | Shared rose/blush tokens, 16px card radii, soft shadows, typography, and `StatusBadge` language from the public site. |

### Shell anatomy

```text
┌──────────────────────────────────────────────────────────────┐
│ Navbar (session-aware)                                       │
├───────────────┬──────────────────────────────────────────────┤
│               │ Page header: eyebrow · title · description   │
│ Sidebar       │ ───────────────────────────────────────────── │
│ • Overview    │ Stat card · Stat card · Stat card             │
│ • Role links  │ ───────────────────────────────────────────── │
│ • Profile     │ Content panel: table / cards / forms         │
│ • Back        │ Loading · empty · error · toast feedback     │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 2. Role-based navigation map

| Role | Workspace label | Sidebar links | Server guard |
| --- | --- | --- | --- |
| **Customer** | Customer workspace | Overview · My Bookings · Browse Services · Profile Settings · Back to website | `requireCustomerPage` / `requirePageAccess("customer")` |
| **Vendor** | Vendor workspace · plan badge | Overview · My Services · Booking Requests · Subscription · Profile Settings · Back to website | `requireVendorPage` / `requirePageAccess("vendor")` |
| **Admin** | Admin workspace · Administrator access | Overview · Users · Services · Transactions · Profile Settings · Back to website | `requireAdminPage` |

**Rules**

- `/dashboard` resolves to the signed-in user's own role dashboard via `getDashboardPath(role)`.
- A customer opening `/admin/users` is redirected to `/customer/dashboard`.
- A vendor opening `/admin/users` is redirected to `/vendor/dashboard`.
- Hiding links is not sufficient: every protected page and API verifies role server-side.
- Blocked users cannot reach protected pages or APIs.

---

## 3. Statistics cards

Each metric card follows the same visual contract so users can scan any workspace instantly.

| Part | Treatment |
| --- | --- |
| Label | Uppercase, 10px, slate/muted, letter-spaced |
| Value | Large bold number, 2xl–3xl, deep ink |
| Hint | One short explanatory line below the value |
| Icon | Rose/amber/emerald rounded icon tile |
| Tone | Rose for primary counts, amber for pending, emerald for success/revenue |

| Role | Metric cards |
| --- | --- |
| **Customer** | Total Requests · Pending · Accepted · Rejected |
| **Vendor** | Total Services · Active Services · Pending Requests · Accepted Bookings · Current Plan (`Free 0/3`) |
| **Admin** | Total Registered Users · Total Vendors · Total Customers · Total Services · Pending Services · Total Transactions |

---

## 4. Customer dashboard

**Goal:** help couples track every booking request and keep wedding plans organized.

### Overview

- Greeting with the customer's first name.
- Four statistic cards: total, pending, accepted, rejected requests.
- Recent booking requests with status chips and a **View all** action.
- Primary CTAs: **My bookings** and **Browse services**.

### My Bookings

| Field | Display |
| --- | --- |
| Service | Image + name |
| Vendor | Vendor name/tagline |
| Event date | Formatted date |
| Event location | City/venue text |
| Request date | Date the enquiry was sent |
| Status | `StatusBadge`: pending / accepted / rejected / cancelled |

**Interactions**

- View booking details inline.
- Cancel only a **pending** request, through `ConfirmDialog`.
- Cancelled/accepted/rejected requests become read-only.
- All outcomes surface as sonner toasts with inline error retry where needed.

---

## 5. Vendor dashboard

**Goal:** let vendors manage listings, respond to couples, and understand their subscription at a glance.

### Overview

- Greeting with the vendor's first name.
- Stat cards: total services, active services, pending requests, accepted bookings, current plan.
- Recent services with approval-status messaging.
- Recent booking requests with a pending-review counter.
- Plan-aware hint: Free plan limit `3` active services; Premium unlimited.

### Add Service / My Services

| Field / action | Requirement |
| --- | --- |
| Service name | Required, validated |
| Category | One of the six canonical WedPlan categories |
| Description | Required, multi-line |
| Price | Required numeric value |
| Location | Required text |
| Service image | Uploaded as a file through ImgBB |
| Status | Defaults to `pending` until admin approval |
| Approval status | Visible in the services table |
| Edit / delete | Allowed only on vendor-owned services |
| Availability | **Pause / Resume** toggle; paused services cannot be booked |
| Rejected services | Never visible to customers |

### Booking Requests

| Column | Details |
| --- | --- |
| Customer | Name + avatar initials |
| Service | Service title |
| Event date / location | Full event details |
| Message | Customer's additional note |
| Status | Pending / accepted / rejected / cancelled chip |

**Actions:** Accept or reject **only pending** requests. Once processed, the request cannot be handled again. Vendors cannot modify requests belonging to another vendor.

### Subscription

| Plan | Included benefits |
| --- | --- |
| **Free** | Maximum 3 active services, basic vendor dashboard, booking request management |
| **Premium** | Unlimited active services, Premium vendor badge, all Free features |
| **Upgrade CTA** | Clear **Upgrade to Premium** button leading to Stripe Checkout |

Premium becomes active only after a verified Stripe webhook event. Success and cancel pages provide branded confirmation, pending, and error states.

---

## 6. Admin dashboard

**Goal:** give administrators a secure, read-mostly console for marketplace health and moderation.

### Overview

- Six statistic cards: total users, vendors, customers, services, pending services, transactions.
- Transaction card includes total payment volume.
- Capability cards linking to Users, Services, and Transactions.

### Manage Users

- Search by name, email, or business name.
- Filter by role: All / Customers / Vendors / Admins.
- Change another user's role between customer, vendor, and admin.
- Block or unblock users; blocked users lose protected access.
- Delete accounts with a themed confirm dialog.
- Admin cannot change their own role, block/unblock themselves, or delete themselves.

### Manage Services

- View all submitted services with status.
- Search and filter by status/category.
- Approve, publish, unpublish, reject, edit, or delete inappropriate listings.
- Only approved and active services appear on the public marketplace.

### Transactions

Read-only ledger with:

| Column | Details |
| --- | --- |
| Vendor | Vendor name/email |
| Plan | Free / Premium |
| Amount | Payment amount + currency |
| Status | Payment status chip |
| Date | Transaction date |

Admins cannot manually mark an unsuccessful payment as successful.

---

## 7. Responsive behavior

| Breakpoint | Sidebar | Metrics | Content |
| --- | --- | --- | --- |
| `≥ 1280px` | Full 260px rail | 3–4 cards per row | Wide tables, side-by-side panels |
| `768–1279px` | Compact / collapsible rail | 2 cards per row | 2-column forms and panels |
| `< 768px` | Off-canvas drawer from header menu | 1 card per row | Stacked filters, horizontal-scroll or card tables, full-width dialogs |

**Rule of thumb:** if a table needs horizontal scrolling on a phone, prefer a card layout.

---

## 8. Visual system

| Token | Value / component | Usage |
| --- | --- | --- |
| Primary rose | `#9F1239` / `bg-rose-500` | Active nav, primary buttons, emphasis |
| Blush surface | `#FFF7F8` | Dashboard background and alternating rows |
| White panel | `#FFFFFF` | Cards, tables, form panels |
| Deep ink | `#1E293B` | Values and headings |
| Muted slate | `#64748B` | Labels, hints, metadata |
| Pending | Amber | Pending bookings/services |
| Accepted / published | Emerald | Confirmed bookings, live listings |
| Rejected / cancelled | Muted rose or slate | Closed states |
| Radius | `16px` cards, `12px` controls | Consistent softness |
| Shadow | `shadow-sm shadow-rose-100/40` | Gentle depth |

---

## 9. Feedback & interaction rules

- [x] Skeletons appear while counts and tables load.
- [x] Inline error banners include a retry action instead of blank panels.
- [x] Empty states always offer a next step.
- [x] Destructive actions use `ConfirmDialog`, never native `confirm()`.
- [x] Success and failure actions use sonner toasts, never `alert()`.
- [x] Only pending bookings can be accepted, rejected, or cancelled.
- [x] Every mutation is authorized server-side by session role and resource ownership.
- [x] Navigation, buttons, filters, dialogs, and links are keyboard accessible with visible focus states.
- [x] Reduced-motion preferences disable dashboard animations.
- [x] All buttons and links resolve to real routes or actions.

---

## 10. Component inventory

| Component | Responsibility |
| --- | --- |
| `DashboardShell` | Shared dashboard frame with sidebar + main content |
| `DashboardSidebar` | Role-aware navigation, active state, profile/back links |
| `StatCard` | Consistent metric presentation |
| `StatusBadge` | Shared status language across bookings and services |
| `ConfirmDialog` | Safe destructive confirmations |
| `LoadingStates` | Spinner, page/dashboard skeletons |
| `States` | Empty, error, and not-found presentations |
| `RefreshButton` | Inline retry control for failed API reads |
| `VendorServicesManager` | Service CRUD, image upload, availability, approval status |
| `VendorBookingsManager` | Accept/reject pending requests |
| `CustomerBookingsManager` | Booking history and pending cancellation |
| `UsersManager` | Admin user search, roles, block/unblock, delete |
| `ServicesManager` | Admin service moderation |
| `TransactionsTable` | Read-only transaction ledger |

---

## 11. QA checklist

- [x] Customer, vendor, and admin dashboards render correct navigation and metrics.
- [x] `/dashboard` redirects to the signed-in role dashboard.
- [x] A vendor opening `/admin/users` is redirected to `/vendor/dashboard`.
- [x] Direct URL access cannot cross role boundaries.
- [x] Admin delete confirmation opens and cancels safely.
- [x] Loading users/services state appears and resolves.
- [x] Payment success/cancel missing-reference states render correctly.
- [x] Every dashboard route reloads without 404/504 errors.

---

> **Implementation note:** this document describes the dashboard UI in `src/app/{customer,vendor,admin}/dashboard`, `src/components/dashboard/`, and `src/components/admin/`. For the public-facing design system, see [`UI-DESIGN-REQUIREMENTS.md`](./UI-DESIGN-REQUIREMENTS.md).
