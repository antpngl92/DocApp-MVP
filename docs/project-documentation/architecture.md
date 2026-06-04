# Architecture

## Overview

DocApp is a Next.js App Router application for clinic appointment booking, deposit payment, and Google Calendar sync.

The app has four major surfaces:

1. Public/marketing pages.
2. Public booking and checkout status pages.
3. Authenticated patient account pages.
4. Authenticated clinic admin pages.

The database is the source of truth for clinics, users, services, appointments, payment orders, and sync state. Stripe and Google Calendar are external systems.

## Prototype Reference

The existing `D:\Projects\DocApp` prototype uses:

- Next.js App Router without a `src/` directory.
- Prisma with PostgreSQL.
- Clerk middleware and a local `User` table synced by Clerk webhooks.
- Stripe Checkout for one-time BGN appointment payments.
- Google Calendar API for calendar listing, calendar creation, and event creation.
- Resend for admin email notification when Google Calendar creation fails.
- Tailwind CSS, shadcn/Radix-style UI primitives, lucide icons, React Hook Form, Zod, Sonner, and Zustand.

The rebuild may reuse stable ideas, environment variable names, scripts, UI patterns, and integration setup from the prototype, but it should not copy the fragile lifecycle behavior directly.

The prototype's shadcn/Radix UI component setup and reusable UI components are not approved for migration. New UI should be guided by approved SuperDesign explorations.

Prototype issues that the MVP architecture must correct:

- Payment is finalized from `/checkout/success`; the rebuild must finalize only through Stripe webhooks.
- Google Calendar event creation is triggered from the success page; the rebuild must trigger it after webhook-confirmed payment or authorized manual confirmation.
- Appointment status, payment status, and calendar sync state are not cleanly separated.
- Pending slot locks do not have explicit expiration.
- Calendar/payment side effects are not fully idempotent.
- Some prototype route paths and actions drifted out of sync.
- Some Prisma action types drifted from the schema.
- Admin authorization uses Clerk metadata, but organization/clinic scoping is not modeled yet.

## Architecture Principles

- Keep the app clinic/organization-scoped from the beginning.
- Keep route/page files thin.
- Keep business logic in feature services, validators, mappers, and server modules.
- Keep payment fulfillment webhook-driven.
- Keep Google Calendar as a sync target, not the source of truth.
- Keep patient data minimal and privacy-conscious.
- Keep patient account access ownership-checked.
- Keep server-only code out of client components.
- Prefer production-shaped foundations over fragile prototype shortcuts.

## Main Domains

- Authentication and organization membership
- Patient accounts and patient ownership
- Clinic configuration
- Doctors
- Cabinets/rooms/resources
- Services and pricing/deposits
- Availability and slot generation
- Public booking
- Patient appointment dashboard
- Appointment lifecycle
- Stripe payment lifecycle
- Google Calendar sync lifecycle
- Notifications
- Audit logs

## Suggested Route Groups

```txt
src/app/
├── (marketing)/
├── (public)/
│   ├── booking/
│   └── checkout/
├── (patient)/
│   └── account/
└── (admin)/
    └── admin/
```

## Implemented App Foundation Routes

Phase 4 establishes these route foundations:

```txt
/
/support
/booking/[clinicSlug]
/checkout/success
/checkout/cancel
/checkout/expired
/checkout/status/[reference]
/admin
/account
```

The admin and patient route groups are prepared for authentication boundaries, but route protection is implemented in the authentication phase.

A standalone public `/services` informational route is not part of the MVP foundation. Public service selection belongs inside the clinic-branded booking flow unless a later product decision adds a separate services page.

Checkout success, cancel, expired, and status routes are read-only UI foundations. They must not mutate appointment, order, payment, or calendar state.

## App Foundation State Strategy

The Phase 4 foundation includes organization-scoped cache-tag helpers for future server-state caching.

Do not add a global client state store until a concrete UI-state need exists. Server state remains in the database/server layer, and later feature work should use scoped invalidation/refetch behavior after webhooks or external sync updates.

## Internationalization Foundation

The app uses `next-intl` with Bulgarian, English, Spanish, German, French, and Italian message catalogs.

The selected locale is stored in a first-party `docapp-locale` cookie and applies without locale-prefixed URLs. The shared navigation contains the language selector, Server Components load translated copy through `next-intl/server`, and Client Components receive translation context from the root provider.

## Server-Side Boundaries

Server-only code should live in `src/server` or server-only feature modules.

Examples:

- Stripe client creation
- Stripe webhook signature verification
- Google Calendar client creation
- Prisma database access
- authorization helpers
- audit logging
- sensitive environment variable access

Client components must not import these modules.

## Source Of Truth

DocApp database is the source of truth for:

- organizations/clinics
- users/memberships/roles
- doctors/resources/services
- availability rules
- appointments
- orders and payment state
- Google Calendar sync state
- notification state
- audit logs

Stripe is the source of truth for payment settlement, but local state should mirror relevant payment events after verified webhooks.

Google Calendar is a sync target. Failed sync should not erase or invalidate a paid appointment.

Patient account pages read local appointment/order/sync state and must enforce patient ownership.

## External Side Effects

External side effects should be idempotent where practical:

- Stripe webhook fulfillment
- Google Calendar event creation
- Google Calendar retry
- email notification sending

Persist external IDs and sync attempt state for traceability.

Expired short holds and pending-payment locks need a concrete cleanup mechanism, such as a cron/job/service plus webhook handling for `checkout.session.expired`.

## MVP Deployment Shape

Use a normal SaaS URL and a shared database with strict tenant scoping.

Do not use per-clinic databases or subdomains in MVP.

## Future Architecture Considerations

Consider later only after the pilot workflow is stable:

- Stripe Connect for real multi-clinic money movement
- durable job queue for retries/background processing
- SMS reminder provider
- custom clinic domains
- multi-language UI
- advanced analytics
