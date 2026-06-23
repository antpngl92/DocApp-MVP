# Architecture

## Overview

DocApp is a single-practice appointment application for an independent healthcare professional operating one or more cabinets/offices.

Each customer receives a separate deployment, database, Prisma configuration, Clerk instance/configuration, Stripe configuration, and Google integration. The application does not switch between practices and does not share operational data across customers.

## Domain Shape

The main ownership chain is:

```txt
Organization (technical practice root)
  -> Cabinet
    -> CabinetService / service assignment
    -> AvailabilityRule / blocked time
    -> SlotHold
    -> Appointment
    -> Google calendar mapping
```

`Organization` remains the internal ownership root because it already provides durable scoping for users, memberships, audit events, and future records. Product copy should call it a practice.

`Cabinet` is the primary bookable entity. It identifies the professional/location combination patients select, for example `Dr. Anton - Pleven` or `Dr. Anton - Pordim`.

The target architecture has no operational `Doctor` model. The practice owner is represented by an active `OrganizationMember` with role `admin`. Optional invited staff use role `receptionist`. Patients use `PatientProfile` and are not staff members.

## Main Domains

- identity: Clerk identity sync, local users, staff memberships, patient profiles
- practice: technical ownership, public practice settings, homepage content
- cabinets: cabinet identity, location, contact data, service assignments, availability
- booking: slot generation, holds, pending appointments, confirmed appointments
- payments: Stripe Checkout, orders, webhook fulfillment, refunds
- calendar: one practice Google connection, cabinet calendar mappings, sync attempts
- notifications: booking email delivery and idempotency
- audit: sensitive administrative and lifecycle actions

## Route Surfaces

```txt
src/app/
  (public)/       public practice pages and booking discovery
  (auth)/         sign-in, sign-up, and post-auth routing
  (patient)/      authenticated patient account
  (admin)/        authenticated staff dashboard
  api/            Clerk, Stripe, cleanup, and integration webhooks/routes
```

Route groups organize layouts and do not change URLs. Public practice routes belong under one `(public)` group; do not split them into marketing and clinic-public groups.

## Authorization

Authorization is enforced server-side:

- `admin`: full control over the practice, cabinets, integrations, settings, staff, and appointments
- `receptionist`: only explicitly allowed operational appointment access across cabinets
- patient: only their own profile and appointments

UI visibility follows these permissions but never replaces server checks. Every practice-owned query must be scoped through the local `Organization` even though each deployment contains one practice.

## Source Of Truth

- local PostgreSQL records are the source of truth for practice settings, cabinets, services, availability, appointments, payments, and permissions
- Clerk is the identity provider, not the role/permission source of truth
- Stripe webhooks are the payment-finalization source of truth
- Google Calendar is a synchronization target, not the appointment source of truth

## External Integrations

One practice-owned Stripe account receives deposits for all cabinets. Split payments and Stripe Connect are outside MVP.

One practice-owned Google account may contain multiple calendars. Each cabinet can map to one calendar. Local booking remains available when Google integration is not configured or temporarily fails.

External effects must be idempotent and durably tracked. A Google failure must not undo a paid local appointment.

## State Strategy

Use server-rendered data and server-state caching for authoritative records. Keep short-lived UI state local to components. Do not mirror the database in a global client store.

Persist slot holds because double-booking prevention must work across browsers and server instances. A hold identifies the cabinet, service, time interval, anonymous token/session, state, and expiry; it must not contain patient contact or medical data.

## Prototype Reference

The old `D:\Projects\DocApp` prototype may be inspected for integration names, scripts, and behavior. It is not the architecture source of truth and its doctor/clinic/resource assumptions must not be copied into the MVP.

## Dependency Order

1. Complete the cabinet-focused identity/domain reset.
2. Model cabinets and cabinet service/availability configuration.
3. Build cabinet-based slot generation and holds.
4. Build authenticated pending appointment creation.
5. Add Stripe Checkout and webhook fulfillment.
6. Connect Google and map calendars to cabinets.
7. Add patient and staff appointment-management pages.
