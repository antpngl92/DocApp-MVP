# DocApp MVP Scope

## Product Summary

DocApp is a deposit-based appointment booking and calendar-management tool for an independent healthcare professional operating one or more cabinets/offices.

The owner may work from one cabinet or from several locations on different days. For example, the same doctor may operate `Dr. Anton - Pleven` and `Dr. Anton - Pordim`. Patients choose the cabinet they want to visit, select a service and available time, and pay the required deposit.

The MVP is not a clinic workforce-management system. It does not model salaried doctors, doctors renting rooms from a clinic, payroll, revenue sharing, or clinic accounting. It is also not a public doctor marketplace, medical-record system, prescription platform, insurance tool, or generic booking application.

## Core Terminology

### Practice

The independent professional's business and the ownership boundary for one DocApp deployment.

The existing `Organization` database model may remain as the technical ownership root, but product copy and domain documentation should call it a practice rather than a clinic or tenant.

### Cabinet

The primary bookable operational entity.

A cabinet represents the public identity and location where the professional accepts appointments. It owns or references:

- public name and slug
- address/location and contact information
- services
- prices and deposits
- availability, breaks, blocked time, and holidays
- Google Calendar mapping
- booking settings
- appointments

The English UI may use `Office` or `Practice location` where that is clearer to patients, while the internal domain model may use `Cabinet`.

There is no separate operational provider-profile model in the target MVP architecture. The practice owner/admin is the healthcare professional, and the cabinet's public name identifies the professional/location combination.

## Deployment Model

DocApp MVP is deployed separately for each independent practice.

Each deployment has its own:

- application instance
- database and Prisma configuration
- local ownership record
- Stripe configuration
- Google Calendar connection
- cabinets and calendars

The MVP must not support practice switching, shared-database multi-tenancy, a doctor marketplace, or cross-practice administration.

## Core Problem

Independent doctors who work from one or more cabinets often manage bookings through phone calls, paper notes, spreadsheets, and separate Google calendars. This creates problems:

- patients can reserve appointments without commitment
- the same cabinet/time can be double-booked
- each location may have different working days and hours
- deposits and remaining balances are tracked manually
- calendar updates can fail or be missed
- the doctor or receptionist spends time coordinating availability manually

DocApp should combine cabinet-specific availability, deposit collection, local appointment records, and Google Calendar synchronization.

## MVP Goals

The MVP should prove that DocApp can:

1. Support one independent practice per deployment.
2. Let the owner create and configure one or more cabinets.
3. Let each cabinet have its own services, prices, deposits, schedule, blocked time, and calendar mapping.
4. Generate available slots from cabinet rules, service duration, buffers, holds, and existing appointments.
5. Let patients choose a cabinet, service, and available time through a public booking flow.
6. Create a local pending appointment and payment order.
7. Send the patient to Stripe Checkout for the deposit.
8. Confirm payment only through Stripe webhooks.
9. Confirm the appointment after payment succeeds.
10. Create the cabinet's Google Calendar event after payment confirmation.
11. Preserve a paid booking if Google Calendar synchronization fails.
12. Let the owner/receptionist view cabinet schedules, payments, remaining balances, and sync status.
13. Support authorized manual bookings for phone, message, or in-person requests.
14. Let patients register, log in, view their appointments and payment state, and request cancellation when policy allows.
15. Keep patient data minimal and appointment-focused.

## Target Users

### Primary User: Practice Owner/Admin

The independent doctor or healthcare professional who owns the deployment.

Typical needs:

- create cabinets for different cities or addresses
- choose which days and times they work in each cabinet
- configure cabinet-specific services, prices, and deposits
- map each cabinet to a Google Calendar
- see schedules and booked hours by cabinet
- reduce no-shows
- track deposits and remaining balances
- create manual appointments

The owner/admin is the professional. A second operational provider profile is not required.

### Secondary User: Receptionist

An optional invited staff member who assists the practice.

Typical needs:

- view schedules for all cabinets in the deployment
- create manual bookings
- review patient contact and appointment details
- update allowed appointment states

Receptionists cannot change ownership, payment credentials, Google account connection, staff access, or other admin-only settings.

### Patient

A patient who books with a specific cabinet.

Typical needs:

- browse the available cabinets
- understand where the cabinet is located
- select a service and available time
- see full price, deposit due now, and remaining balance
- pay the deposit securely
- view their own appointments
- request cancellation when policy permits

## Roles And Registration

MVP roles are:

- `admin`: the privately provisioned practice owner
- `receptionist`: invited by the admin
- patient access through `PatientProfile`

The target MVP does not require another provider staff role, provider invitation, onboarding approval, or linked provider profile.

Patients may register publicly. Admin accounts are provisioned through a trusted process. Receptionists join only through invitation or explicit admin approval.

## Cabinet-Centered Booking Flow

The patient flow is:

```text
Choose cabinet
→ Choose service
→ Choose available time
→ Sign in or register before final submission
→ Confirm contact details and deposit
→ Pay through Stripe Checkout
→ Confirm from Stripe webhook
→ Create event in the cabinet's mapped Google Calendar
```

Every availability, hold, appointment, payment, and calendar operation must be scoped to the selected cabinet and the local practice ownership boundary.

## Payments

One practice-owned Stripe account receives deposits for appointments across every cabinet in that deployment.

Cabinets are booking/location configurations, not separate payment recipients. DocApp does not split deposits between a clinic and doctors, calculate wages, calculate rent, or distribute money between parties.

The UI must show:

- full appointment price
- deposit due now
- remaining balance paid directly to the professional/practice
- cancellation and non-refundable no-show policy

Patients cannot request or initiate refunds through DocApp. Authorized admin actions may issue or record refunds where appropriate.

## Google Calendar

One practice-owned Google account may contain multiple calendars.

For MVP, each cabinet normally maps to one Google Calendar:

```text
Practice Google account
├── Calendar: Dr. Anton - Pleven
└── Calendar: Dr. Anton - Pordim
```

Google Calendar remains a sync target. Local cabinet settings and local appointments remain the product source of truth.

## Manual Bookings

The admin or receptionist may create appointments for patients who contact the practice by phone, message, or in person.

Manual booking supports:

- selecting a cabinet
- selecting a service and time
- selecting an existing patient account or entering minimal contact details
- pay-at-practice, paid externally, no-deposit-required, or internal/free payment states
- availability checks and double-booking prevention
- Google Calendar event creation after authorized confirmation
- audit logging

## Patient Account Features

Patients can:

- register and log in
- maintain minimal contact information
- book with a cabinet
- view their own upcoming and past appointments
- view deposit/payment status and remaining balance
- view practice cancellation/refund policy
- request cancellation when allowed

Patient accounts must not expose staff data, payment internals, or medical-record-like functionality.

## Privacy Boundaries

Collect only what is needed for appointment booking:

- patient name
- email
- phone
- selected cabinet
- selected service
- appointment time
- payment/order state
- optional non-sensitive booking note where explicitly allowed

Do not store diagnoses, symptoms, prescriptions, treatment notes, medical documents, insurance records, or medical history.

## Out Of Scope

- clinic workforce management
- multiple salaried doctors under one clinic
- cabinet/room rental accounting
- payroll, commissions, or revenue sharing
- public doctor marketplace
- patient reviews
- medical records
- prescriptions
- insurance integrations
- AI doctor matching
- advanced CRM
- recurring appointments
- rescheduling unless explicitly approved later
- shared-database multi-practice SaaS
- Stripe Connect marketplace payments
- ads

## MVP Success Criteria

The MVP succeeds when an independent professional can:

1. Create one or more cabinets.
2. Configure different schedules and services for each cabinet.
3. Share a public booking page.
4. Accept appointment deposits into one practice-owned Stripe account.
5. Confirm appointments through Stripe webhooks.
6. Sync each confirmed appointment to the correct cabinet calendar.
7. View cabinet schedules, deposit state, and remaining balances.
8. Prevent double-booking across confirmed appointments and pending locks.
9. Recover from calendar sync failure without losing paid appointments.
10. Operate the practice without manually patching booking/payment records.

## Prototype Findings To Carry Forward

The prototype demonstrated that:

- cabinet/calendar selection is feasible
- weekday-based slot generation is feasible
- responsive calendar views are useful
- Prisma appointment and order records are useful
- Stripe Checkout can collect deposits
- Google Calendar synchronization is useful

The rebuild must correct prototype weaknesses by using webhook payment fulfillment, durable slot locks, cabinet-centered ownership, separate sync status, minimal patient data, and no advertising surfaces.
