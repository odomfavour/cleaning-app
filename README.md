# Cleanin: cleaning-service booking platform

Next.js (App Router) · TypeScript · Tailwind v4 · MongoDB · shadcn/ui (Radix) · React Hook Form + Zod · Lucide · Sonner.
Data is served by Next.js Route Handlers connected to MongoDB.

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
- Creating an account with the same email claims the guest's verified requests.

## Backend Architecture
The backend is built with Next.js Route Handlers (`app/api/**/route.ts`) backed by MongoDB and Mongoose models in `server/models/`.
- Client services in `lib/api/services/` call these endpoints with Axios.
- React Query hooks in `lib/hooks/` handle query caching, mutations, and automatic cache invalidation.
- Domain types live in `lib/types.ts`.

## Structure
- `components/ui`: **shadcn/ui** components (button, input, dialog, sheet, popover, tabs, table, accordion, calendar, …). Add more with `pnpm dlx shadcn@latest add <name>`; theme tokens live in `app/globals.css` (`--primary` is the Cleanin navy).
- `components/kit`: app-level wrappers built on shadcn (Button with `loading`/`href`, Field/Input/Select/DatePicker with label + error, Dialog with `open`/`onClose`, DataTable, StatusBadge, Timeline, FileUploader, Charts…). Pages import from here so their props stay stable.
- `components/shared`: AppShell, NotificationPanel, RequestSummary, QuoteDocument, StaffAssignment
- `components/request-form`: the 8-step request form (+ Zod schema), shared by public and logged-in flows
- `components/landing`: new landing sections; older sections remain in `components/*Section.tsx`
- `lib/config.ts`: organization name/phone/address (landing-page sections still contain a few literal copies)
