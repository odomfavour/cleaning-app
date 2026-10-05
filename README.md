# Cleanin: cleaning-service booking platform (frontend)

Next.js (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Radix) · React Hook Form + Zod · Lucide · Sonner.
No backend yet: all data comes from a mock API layer that persists to `localStorage`.

```bash
pnpm install
pnpm dev
```

## Customer access model
Customers do **not** need an account to request a cleaning.

| Route | Access |
|---|---|
| `/` `/request-cleaning` `/request-cleaning/success` `/request` `/request/[reference]` `/login` `/register` `/forgot-password` | Public |
| `/dashboard/**` (requests, quotes, payment, bookings, review, profile, `/dashboard/request-cleaning`) | Account **or** verified session |

- `/request-cleaning` (public) and `/dashboard/request-cleaning` (logged in) render the same `components/request-form/RequestForm` with `mode="public" | "account"`.
- A guest submission creates a customer record with `hasAccount: false`. A reference number is a display ID only: `/request/[reference]` shows status and masked contact details; everything else needs a one-time code sent to the email/phone on the request (`VerifyAccess`, `AccessGate`) or a sign-in.
- Mock code is `123456`. Creating an account with the same email claims the guest's requests (the real backend must verify the email first).

## Demo
Customer `chiamaka@example.com`, admin `admin@cleanin.ng`, staff `staff@cleanin.ng` (any password; `wrong` shows the error state).
Guest demo: open `/request/REQ-1029` (quote ready, needs verification, code `123456`) or `/request/REQ-1030` (under review).
Reset demo data by clearing `localStorage` keys `cleanin-demo-v2` and `cleanin-session-v1`.

## Replacing the mock layer with Next.js Route Handlers + MongoDB
UI code only imports `api` from `lib/api`. To go live, re-implement `lib/api/index.ts` with `fetch` calls
(calling your `app/api/**/route.ts` handlers) that keep the same method names and return types (`api.requests.getAll()`, `api.quotes.accept(id)`, …).
Then delete `lib/api/db.ts` and `lib/mock/`. Domain types live in `lib/types.ts`.

## Structure
- `components/ui`: **shadcn/ui** components (button, input, dialog, sheet, popover, tabs, table, accordion, calendar, …). Add more with `pnpm dlx shadcn@latest add <name>`; theme tokens live in `app/globals.css` (`--primary` is the Cleanin navy).
- `components/kit`: app-level wrappers built on shadcn (Button with `loading`/`href`, Field/Input/Select/DatePicker with label + error, Dialog with `open`/`onClose`, DataTable, StatusBadge, Timeline, FileUploader, Charts…). Pages import from here so their props stay stable.
- `components/shared`: AppShell, NotificationPanel, RequestSummary, QuoteDocument, StaffAssignment
- `components/request-form`: the 8-step request form (+ Zod schema), shared by public and logged-in flows
- `components/landing`: new landing sections; older sections remain in `components/*Section.tsx`
- `lib/config.ts`: organization name/phone/address (landing-page sections still contain a few literal copies)
