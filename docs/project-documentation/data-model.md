# Data Model

## Ownership Model

DocApp uses one database per independent practice deployment. `Organization` remains the technical ownership root, but it represents the single practice rather than one tenant in a shared SaaS database.

Practice-owned records should retain `organizationId` where it provides explicit ownership, referential integrity, safer queries, or future-proof constraints. This does not imply cross-practice switching.

## Identity

### User

Local identity synchronized from Clerk.

Core fields:

- `id`
- unique `clerkUserId`
- email and display name
- timestamps

### Organization

Technical root for the independent practice.

Core fields:

- `id`
- practice name/slug
- timezone and default currency
- contact and policy settings
- timestamps

### OrganizationMember

Links staff identities to the practice.

Target MVP roles:

- `admin`: owner/professional with full practice control
- `receptionist`: invited operational staff with limited permissions

Target statuses may include `invited`, `active`, `suspended`, and `revoked`.

There is no target staff `doctor` role. Patients are not organization members.

### PatientProfile

Minimal appointment-management profile linked one-to-one to a local `User`.

Store only necessary contact data. Do not store diagnoses, treatment notes, prescriptions, medical documents, insurance records, or clinical history.

## Cabinet Domain

### Cabinet

The primary public bookable entity.

Suggested fields:

- `id`
- `organizationId`
- public `name`, such as `Dr. Anton - Pleven`
- unique public `slug`
- optional description
- address/location fields
- public phone/email where needed
- optional timezone override only if the product explicitly supports cabinets in different timezones
- `isActive`
- `isBookingEnabled`
- timestamps

There is no separate operational `Doctor` model. Professional identity is expressed through the practice owner and cabinet public content.

### Service

Reusable appointment offering owned by the practice.

Suggested fields:

- name and description
- duration
- buffer before/after
- full price
- deposit amount or percentage
- currency
- active state
- cancellation/refund policy reference

### CabinetService

Explicit assignment connecting a service to a cabinet.

It may override cabinet-specific price, deposit, duration, or active state only if that flexibility is intentionally approved. Every publicly bookable service must have at least one active cabinet assignment.

## Availability

### AvailabilityRule

Recurring weekday schedule for a cabinet, including working interval and optional effective dates.

### BlockedTime

Cabinet-specific exception for breaks, holidays, closures, or manually blocked intervals.

### SlotHold

Short-lived server-side lock preventing two visitors from booking the same cabinet/time.

Minimum data:

- `organizationId`
- `cabinetId`
- `serviceId` or cabinet-service assignment ID
- start/end time
- opaque browser/session token hash
- status
- expiry and conversion timestamp

Do not store patient name, email, phone, Clerk ID, symptoms, or medical details in a hold. Use uniqueness/transaction constraints to prevent overlapping active holds and appointments.

## Appointments And Payments

### Appointment

Belongs to one practice and one cabinet, with a selected service snapshot and optional patient ownership.

Keep separate fields/enums for:

- appointment lifecycle
- payment lifecycle
- Google sync lifecycle

Manual appointments without patient accounts store minimal contact snapshots. Patient-created appointments link to `PatientProfile`.

### AppointmentStatusHistory

Append-only history for meaningful appointment state changes, including actor and safe reason metadata.

### AppointmentOrder

Tracks the deposit payment independently from appointment state.

Store server-calculated amounts, currency, Stripe Checkout Session ID, Payment Intent ID where available, order status, expiry, and refund references.

## Google Calendar

### GoogleAccountConnection

One active server-side Google account connection per practice for MVP. Store credentials/tokens securely and never expose them to the browser.

### CabinetCalendarMapping

Maps a local cabinet to a discovered Google calendar ID. Calendar IDs and sync configuration belong here, not on `Organization` or in a Doctor model.

### CalendarSyncRecord

Tracks event ID, sync status, attempts, timestamps, and sanitized failure details for an appointment.

## Audit And Notifications

`AuditEvent` records sensitive identity, role, settings, appointment, payment, and integration changes. `NotificationLog` tracks idempotent email delivery.

Audit and notification payloads must avoid secrets and unnecessary patient data.

## Constraints And Indexes

At minimum, plan constraints/indexes for:

- unique `User.clerkUserId`
- unique active/invited membership per normalized email/practice
- unique cabinet slug within the practice
- unique cabinet/service assignment
- cabinet availability and blocked-time lookups
- appointment and active-hold cabinet/time lookups
- patient appointment lookups
- Stripe IDs
- Google event IDs and cabinet calendar mapping
- status/expiry cleanup queries

## Migration From Current Code

Before new booking models are added:

1. Remove the existing `Doctor` model and relations.
2. Remove doctor role values and doctor onboarding/approval state.
3. Regenerate Prisma Client and remove stale generated Doctor symbols.
4. Introduce `Cabinet` as the sole bookable operational entity.
5. Update authorization and tests to admin/receptionist/patient semantics.
