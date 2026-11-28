# UI Design Requirements

> **Design intent:** WedPlan should feel like a calm, premium wedding planner — not a generic marketplace. Ivory and blush surfaces, deep rose accents, generous whitespace, crisp typography, and restrained celebratory details guide the couple from inspiration to booking.

---

## 1. Design language

| Token | Value | Usage |
| --- | --- | --- |
| Primary rose | `#9F1239` | Primary buttons, active navigation, emphasis |
| Accent rose | `#E11D48` | Gradients, focus accents, section borders |
| Blush surface | `#FFF7F8` | Page background, alternating table rows |
| Deep ink | `#1E293B` | Headings and primary body copy |
| Muted slate | `#64748B` | Supporting text, metadata, captions |
| Success | Emerald | Accepted bookings, published services |
| Warning | Amber | Pending states, paused availability |
| Danger | Rose/red | Rejected, cancelled, destructive actions |

**Type scale:** `12 / 14 / 16 / 20 / 28 / 36 px`  
**Spacing rhythm:** multiples of `8 px`  
**Radii:** `12–28 px`, softened further on hero and feature cards  
**Motion:** short fade/slide reveals only; reduced-motion users get static content

---

## 2. UI design requirements

| Pillar | Requirement from the brief | WedPlan implementation |
| --- | --- | --- |
| Responsive layout | Responsive on desktop, tablet, and mobile | Desktop: 3-column service grids and full dashboards. Tablet: 2-column grids with collapsible navigation. Mobile: single-column cards, stacked filters, off-canvas menus, 44px touch targets. |
| Wedding identity | Professional wedding-themed interface | Blush/ivory canvas, rose-to-pink gradients, soft shadows, heart and sparkle accents. Celebratory details stay subtle so content remains primary. |
| Typography & spacing | Consistent spacing, typography, and colors | One type scale, an 8px spacing rhythm, predictable line heights, and consistent alignment across public pages and dashboards. |
| Color system | Consistent colors | Shared CSS variables and Tailwind utilities; semantic status colors are reused for bookings, services, and payments. |
| Component library | Use ShadCN components appropriately | Buttons, Cards, Inputs, Selects, Badges, Avatars, Tabs, Dialogs, Alert Dialogs, Sheets, Tables, and Toasts from the Base UI flavored ShadCN setup. |
| Reusable parts | Reusable components | `ServiceCard`, `CategoryIcon`, `StatusBadge`, `DashboardShell`, `PageHeader`, `ConfirmDialog`, `LoadingStates`, `EmptyState`, `ErrorState`. |
| Motion & focus | Avoid unnecessary animations and visual clutter | Motion `whileInView` reveals and a slow hero zoom. `useReducedMotion()` disables movement. No autoplay noise or decorative overload. |
| Interaction integrity | All buttons and navigation links must work correctly | Every CTA has a real destination or action; hover, focus, active, disabled, and loading states are defined; toasts replace browser alerts. |

---

## 3. Page-level application

| Area | Expected treatment |
| --- | --- |
| **Home** | Full-width animated wedding banner with clear headline, short description, and **Explore Wedding Services** CTA. Six published service cards, six category tiles, **Why Choose WedPlan?**, and **How WedPlan works**. |
| **Browse services** | Sticky search/filter panel with keyword, category, location, price, and sort controls. URL-synced state, responsive card grid, plus loading, empty, and error states. |
| **Service details** | Image gallery, price/location/vendor card, full description, related services, and an auth-aware booking CTA. Vendors and admins cannot book as customers. |
| **Authentication** | Role cards, show/hide password, inline validation, password-strength feedback, optional ImgBB profile upload, Google button, and role-based redirects. |
| **Public chrome** | Session-aware navbar with immediate profile menu updates; complete footer with navigation, contact information, social links, and copyright. |

---

## 4. Quality gates

- [x] No horizontal overflow at `360px`, `768px`, or `1440px`.
- [x] Body copy and controls meet WCAG AA contrast.
- [x] Focus rings and keyboard navigation are visible on every interactive element, including the skip-to-content link.
- [x] Touch targets are at least `44px` on mobile navigation, filters, category chips, and primary actions.
- [x] Loaders, empty states, and error states appear wherever data is fetched.
- [x] No native `alert()` or `confirm()` for normal feedback.
- [x] Every button and link resolves to a real route or action.
- [x] Animations respect `prefers-reduced-motion`.

---

## 4.5 Implementation map

The seven brief requirements are enforced in code rather than left as a design checklist:

| Brief requirement | Where it is enforced |
| --- | --- |
| Responsive on desktop, tablet, and mobile | `Navbar.jsx` (compact mobile header + `Sheet` drawer), `DashboardSidebar.jsx` (desktop rail + mobile drawer), `ServiceExplorer.jsx` (stacked filters and horizontally scrollable category chips), and 3/2/1-column card grids |
| Professional wedding-themed interface | `globals.css` shared rose/blush/ink tokens, `AuthShell.jsx`, `ServiceCard.jsx`, `Footer.jsx`, and role-based dashboard shells |
| Consistent spacing, typography, and colors | `:root` design tokens, shared focus rings, `buttonVariants` for CTAs, and reusable `StatCard` / `StatusBadge` presentation |
| Use ShadCN components appropriately | `Button`, `Input`, `Sheet`, `DropdownMenu`, `Avatar`, `AlertDialog`, `Select`, `Card`, and Sonner toasts |
| Reusable components | `ServiceCard`, `CategoryIcon`, `ServiceExplorer`, `Reveal`, `DashboardShell`, `ConfirmDialog`, `LoadingStates`, and `States` |
| Avoid unnecessary animations and visual clutter | One restrained reveal per section, no per-card stagger delays, simplified hero/auth/service decorations, and a global `prefers-reduced-motion` override |
| All buttons and navigation links must work correctly | Real routes/actions only, `aria-current` and `aria-pressed` feedback, keyboard focus rings, toasts instead of native dialogs, and server-side role checks on protected actions |

Additional interaction polish: a skip-to-content link sits before the navbar, and the results count in `ServiceExplorer` is an `aria-live` region.

---

# Dashboard UI Requirements

> **Workspace intent:** One consistent shell, three role-aware workspaces, and zero room for cross-role confusion. The visual foundation is shared; navigation, metrics, and actions are determined by the authenticated role and verified again on the server.

> **Expanded specification:** the complete dashboard brief, including role-by-role tables, responsive behavior, visual tokens, component inventory, and QA checklist, lives in **[`DASHBOARD-UI-REQUIREMENTS.md`](./DASHBOARD-UI-REQUIREMENTS.md)**.

---

## 5. Shared shell anatomy

| Element | Requirement & implementation |
| --- | --- |
| **Sidebar navigation** | Fixed 260px rail on desktop with brand, role label, active pill indicator, workspace links, profile, and logout. On tablet/mobile it becomes a slide-out drawer opened from the header menu. The current section is always highlighted. |
| **Main content area** | Page header with eyebrow, title, description, and primary action; metric row; content panels; responsive padding and max width. Long tables scroll horizontally or collapse into cards on small screens. |
| **Responsive layout** | Four metric cards per row on desktop, two on tablet, one on mobile. Sidebars and filters collapse; dialogs become full-width sheets where needed. |
| **Role-based navigation** | Customer: Overview · My Bookings · Browse Services · Profile. Vendor: Overview · My Services · Booking Requests · Subscription · Profile. Admin: Overview · Users · Services · Transactions · Profile. No cross-role links are rendered. |
| **Statistics cards** | Each card pairs a bold value with a short label, contextual hint, and icon. Status colors stay consistent: pending amber, accepted/published green, rejected/cancelled muted rose or slate. |
| **Consistent theme** | The same rose/blush tokens, card radii, shadows, typography, and badge language as the public site. Dashboards never introduce a separate visual dialect. |

---

## 6. Metrics by role

| Role | Statistics shown |
| --- | --- |
| **Customer** | Total booking requests · Pending · Accepted · Rejected |
| **Vendor** | Total services · Active services · Pending booking requests · Accepted bookings · Current subscription plan, with a Free `0/3` counter |
| **Admin** | Total registered users · Vendors · Customers · Services · Pending services · Transactions |

---

## 7. Role workspace details

| Role | Primary views | Key interactions |
| --- | --- | --- |
| **Customer** | Overview + My Bookings | Booking cards show service image/name, vendor, event date/location, request date, and status chip. Pending requests can be cancelled through a themed confirm dialog; all outcomes surface as toasts. |
| **Vendor** | Overview + My Services + Booking Requests + Subscription | Service table includes approval status and edit/delete actions. Add-service form validates required fields and uploads images. Pending bookings can be accepted or rejected once. Premium comparison and upgrade CTA are always visible, and a Premium badge appears after verified webhook activation. |
| **Admin** | Overview + Users + Services + Transactions | Live counts, user search and role filters, block/unblock, service moderation with approve/reject/delete, and a read-only transaction ledger. Admin cannot change their own role or delete themselves. |

---

## 8. Dashboard interaction rules

- [x] Skeletons appear while counts and tables load; inline error banners include a retry action.
- [x] Empty states always offer a next step, such as **Add your first service** or **Browse services**.
- [x] Destructive actions use `ConfirmDialog`; successful and failed actions use toasts.
- [x] Only pending bookings can be accepted, rejected, or cancelled; processed requests become read-only.
- [x] Every mutation is authorized server-side by session role and resource ownership.
- [x] Blocked users are redirected and cannot reach protected pages or APIs.
- [x] Navigation, buttons, filters, dialogs, and links are keyboard accessible with visible focus states.

---

## 9. Reusable component inventory

| Component | Responsibility |
| --- | --- |
| `DashboardShell` / `DashboardSidebar` | Role-aware workspace frame |
| `StatCard` | Consistent metric presentation |
| `StatusBadge` | Shared booking/service status language |
| `ServiceCard` / `ServiceGallery` | Marketplace listing and multi-image detail view |
| `ConfirmDialog` | Safe destructive confirmations |
| `LoadingStates` | Spinner, page/detail/dashboard skeletons |
| `States` | Empty, error, and not-found presentations |
| `RefreshButton` / `BackToTop` | Consistent utility interactions |
| `ServiceExplorer` | Search, filters, sorting, URL sync |
| `VendorServicesManager` / `UsersManager` | Domain tables with inline feedback |

---

## 10. Responsive breakpoints

| Breakpoint | Layout behavior |
| --- | --- |
| `≥ 1280px` | Full sidebar, 3–4 column grids, wide tables |
| `768–1279px` | Collapsible sidebar, 2-column grids, compact cards |
| `< 768px` | Off-canvas navigation, single-column content, stacked filters, full-width dialogs |

> **Rule of thumb:** if a component needs horizontal scrolling on a phone, prefer a card layout instead.
