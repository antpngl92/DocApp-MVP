# DocApp MVP Scope

## Product Summary

DocApp is a deposit-based appointment booking and calendar-management tool for small private clinics and appointment-based healthcare practices.

The MVP focuses on letting a clinic owner/admin configure doctors, staff, cabinets/rooms, services, weekday availability, deposit amounts, patient accounts, and Google Calendar sync. Patients can register or log in, book an appointment through a clinic-branded public flow, pay part of the appointment price upfront, and pay the remaining balance at the clinic.

The main goal is not to build a public doctor marketplace, medical-record system, prescription platform, insurance tool, or generic booking app. The MVP is focused on the core booking, payment, and calendar-sync workflow.

## Deployment Model

DocApp MVP is deployed per clinic. Each clinic gets its own application deployment, database, Prisma configuration, and integration credentials.

The local `Organization` record represents the clinic profile and product source of truth inside that deployment. It is not one tenant in a shared multi-clinic database, and it is not a Google account.

The MVP must not support cross-clinic operations, clinic switching, marketplace behavior, or shared-database multi-tenant workflows. Multiple real clinics mean multiple deployments/databases unless a later architecture decision explicitly changes this rule.

## Core Problem

Small private clinics often manage bookings through phone calls, manual calendars, spreadsheets, Google Calendar, or fragmented tools. This creates operational problems:

- receptionists spend time manually coordinating availability
- doctors and cabinets/rooms can be double-booked
- patients reserve appointments without commitment
- no-shows waste doctor time and clinic revenue
- deposits and remaining balances are tracked manually
- clinic admins lack a simple view across doctors and rooms
- failed calendar updates can go unnoticed

DocApp should reduce this operational friction by combining booking, upfront deposit payment, local appointment records, and Google Calendar sync.

## MVP Goals

The MVP should prove that DocApp can:

1. Create a stable single-clinic deployment foundation.
2. Let admins configure doctors, cabinets/rooms, services, prices, deposits, and availability.
3. Generate available time slots from weekday availability, service duration, buffers, and existing appointments.
4. Let patients book an appointment from a public booking flow.
5. Create a local pending appointment and pending payment order.
6. Send the patient to Stripe Checkout for the appointment deposit.
7. Confirm payment only through Stripe webhooks.
8. Confirm the appointment after successful payment.
9. Create a Google Calendar event after successful payment.
10. Handle Stripe cancellation, expiry, and abandoned checkout safely.
11. Handle Google Calendar event creation failures without losing the paid booking.
12. Let admins view appointments, payment status, remaining balances, and sync status.
13. Let admins manually create, cancel, or mark appointments as no-show.
14. Let patients register, log in, view their own appointments, view payment/deposit status, and request cancellation when clinic policy allows it.
15. Keep patient data minimal and privacy-conscious.
16. Support a pilot clinic per deployment; additional clinics require separate deployments/databases.

## Target Users

### Primary User

Clinic admin or business owner of a small private clinic.

Typical needs:

- configure doctors and rooms
- control availability
- see booked hours
- reduce no-shows
- track paid deposits and remaining balances
- ensure bookings appear in Google Calendar

### Secondary User

Receptionist or clinic staff member.

Typical needs:

- manually book appointments for phone calls
- see daily/weekly schedules
- check whether a deposit was paid
- cancel appointments according to clinic rules; rescheduling is out of scope until explicitly added later

### Patient

The patient is not the clinic customer paying for DocApp, but patient registration and login are part of the MVP.

Patients use the public booking flow to reserve a time and pay a deposit/partial prepayment. A patient account is for booking and appointment management only.

Patient account MVP scope:

- register/login
- manage basic profile/contact details
- book appointments
- view upcoming appointments
- view past appointments
- view payment/deposit status
- view remaining balance due at clinic
- view cancellation policy
- request cancellation when clinic policy allows it
- receive booking-related emails

Patient account out of scope:

- medical records
- diagnosis history
- prescriptions
- lab results
- insurance data
- doctor-patient chat
- file uploads
- treatment notes
- health questionnaires unless explicitly added later

## MVP Positioning

Short positioning:

> Deposit-based booking and Google Calendar management for small private clinics.

Primary value:

- reduce no-shows
- simplify booking
- avoid double-booking doctors and rooms
- collect deposits upfront
- keep Google Calendar as the clinic's operational calendar
- give clinic admins a clear dashboard

## Supported Appointment Model

DocApp uses a service-based appointment model.

A service should define:

- service name
- optional description
- duration
- full appointment price
- deposit amount or deposit percentage
- currency
- applicable doctor(s)
- applicable cabinet/room(s)
- buffer time before/after, if needed
- cancellation/refund policy reference
- active/inactive state

Example:

```txt
Service: Initial consultation
Full price: 80 BGN
Deposit due online: 20 BGN
Remaining balance at clinic: 60 BGN
Duration: 30 minutes
```

The patient should clearly see:

- full appointment price
- amount paid now
- amount due at clinic
- cancellation/refund rules

## Booking Flow

The public booking flow should allow a patient to:

1. Open a clinic-branded booking page.
2. Choose service.
3. Choose doctor and/or cabinet/room where applicable.
4. Select an available date/time.
5. Register or log in before final booking/payment if not already authenticated.
6. Confirm or update patient name, email, phone, and optional non-sensitive note.
7. Review full price, deposit, and remaining balance.
8. Pay the deposit through Stripe Checkout.
9. Land on a status page after payment.
10. See the appointment in their patient account once created.
11. Receive confirmation once the booking is confirmed.

The status page should not finalize payment. It should only read the current order/appointment state from the database.

## Availability Features

The MVP should support:

- weekday availability rules per doctor/calendar/resource
- temporary slot holds when a patient selects a slot
- polling-first visibility of slots held by other users
- clinic-configurable slot hold duration
- service duration
- buffer time
- active/inactive calendars/resources
- mobile-friendly date/time selection
- desktop weekly view where useful
- exclusion of confirmed appointments
- exclusion of active temporary slot holds
- exclusion of non-expired pending appointment locks
- clinic-defined unavailable days if implemented in scope

## Payment Features

The MVP should support:

- Stripe Checkout payment mode
- BGN currency by default, with currency stored in the database
- local `AppointmentOrder` records
- Stripe Checkout Session IDs
- Stripe Payment Intent IDs where available
- order statuses: `pending`, `paid`, `cancelled`, `expired`, `refunded`, `failed`
- Stripe webhook route for payment finalization
- idempotent handling of duplicate webhook deliveries
- read-only success and cancel pages

Payment finalization must happen only through Stripe webhooks.

Patients cannot request or self-initiate refunds through DocApp. Deposits are non-refundable by default if the patient does not attend. Refunds are privileged clinic-side actions only and should be audited.

The default non-refundable deposit behavior is a product default and must be shown clearly to patients. Clinics are responsible for choosing policy text appropriate to their business and jurisdiction.

## Appointment Lifecycle

Appointments should use a clear lifecycle:

```txt
pending_payment
confirmed
cancel_requested
cancelled
expired
no_show
completed
```

MVP can start with fewer statuses, but it should not mix payment status, appointment status, and Google Calendar sync status into one field.

`slot_held` is a temporary booking UI/computed state derived from an active `SlotHold`. It does not have to be stored as `Appointment.status`. Appointments begin once a hold is converted into a `pending_payment` booking or when an authorized clinic-side user creates a manual confirmed/pay-at-clinic booking.

Do not use `calendar_sync_failed` as an appointment status. A booking can be `confirmed` while Google Calendar sync status is `failed`.

## Google Calendar Features

The MVP should support:

- connecting one active clinic-owned Google account per local organization for MVP
- discovering multiple calendars from the connected Google account
- mapping discovered calendars to existing local doctors/resources
- keeping clinic, doctor, resource, service, availability, and booking settings local rather than treating Google Calendar as their source of truth
- creating a Google Calendar event after payment is confirmed
- storing the Google Calendar event ID locally
- storing sync status and sync errors locally
- admin notification when Google Calendar creation fails
- admin retry action for failed Google Calendar sync
- safe event titles that do not expose sensitive medical data

Google Calendar should be treated as an external sync target, not the source of truth.

The local organization/clinic is not the Google account. Disconnecting or replacing the Google connection must not delete or invalidate local clinic records.

## Admin Features

The MVP should allow an admin to:

- sign in through Clerk
- use an owner/admin account provisioned through the Clerk Dashboard or a controlled database process
- invite staff users through Clerk Invitations where practical
- invite staff by entering an email and selecting the intended staff role from a dropdown
- activate staff access through local organization membership and role records
- view a dashboard overview
- manage clinic settings
- manage doctors
- manage cabinets/rooms
- manage services
- manage weekday availability
- view appointments
- view payment status and remaining balance
- view Google Calendar sync status
- create manual bookings for receptionist workflows
- create manual bookings for existing patient accounts or manually entered patient contact details
- cancel appointments
- configure patient cancellation request policy
- issue or record refunds only when authorized
- mark no-shows
- retry failed Google Calendar event creation

## Manual Admin-Created Bookings

Authorized clinic staff can create appointments inside the admin/control panel for patients who contact the clinic by phone, message, or in person.

Manual booking should support:

- selecting an existing patient account and attaching the appointment to it
- entering minimal patient details when no patient account exists
- pay-at-clinic, paid externally, no-deposit-required, or internal/free payment modes
- availability checks and double-booking prevention by default
- authorized override only when allowed, with warning, reason, and audit log
- Google Calendar event creation or update after authorized manual confirmation

If a patient later creates an account using the same email/phone as a manual booking, historical linking can be added later. Automatic linking is not required in MVP unless explicitly added.

## Patient Account Features

The MVP should allow a patient to:

- register/login
- manage basic profile/contact information
- book appointments
- view own upcoming and past appointments
- view payment/deposit status
- view remaining balance
- view cancellation/refund policy
- request cancellation when allowed by clinic policy

Patients must not be able to access another patient's appointments, clinic admin records, payment internals, or medical-record-like features.

Manual bookings created by authorized clinic staff can appear in a patient's dashboard when attached to that patient account and visibility rules allow it.

## Notifications

The MVP should support:

- patient confirmation email after payment-confirmed booking
- admin notification when Google Calendar event creation fails
- optional admin notification for successful bookings
- clear user-facing success/cancel/error states

SMS reminders are useful, but can be added after the email-based MVP is stable unless a pilot clinic requires SMS.

## Privacy And Data Boundaries

DocApp should collect the minimum data needed for booking:

- patient name
- email
- phone
- appointment service
- selected doctor/cabinet/time
- payment/order state
- optional patient note only if non-sensitive and clearly labeled

DocApp should not store the following in the MVP:

- diagnoses
- symptoms
- medical documents
- prescriptions
- treatment notes
- insurance records
- medical history

Google Calendar event titles and descriptions must avoid sensitive medical information.

## Out Of Scope For MVP

The following are not MVP requirements:

- public doctor marketplace
- patient reviews
- medical records
- prescriptions
- insurance integrations
- AI doctor matching
- advanced CRM
- complex analytics
- ads on clinic booking pages
- per-clinic custom domains
- automated SMS sequences
- multi-language admin UI unless required by a pilot
- recurring appointments
- rescheduling unless explicitly added later
- resource optimization algorithms
- full accounting system
- automatic clinic onboarding wizard
- team billing complexity
- Stripe Connect marketplace payments

These can be considered after the core booking/deposit/calendar workflow is reliable.

Normal Stripe Checkout without Stripe Connect is acceptable for the single-clinic deployment model when payment ownership and accounting are clear. If DocApp later becomes a shared multi-clinic SaaS where patient deposits belong to different clinics, Stripe Connect or an equivalent platform-payment architecture must be evaluated before that architecture is used.

## MVP Success Criteria

The MVP is successful if a clinic can:

1. Configure doctors, cabinets/rooms, services, deposits, and availability.
2. Share a public booking page with patients.
3. Accept a patient appointment deposit online.
4. Confirm appointments through Stripe webhook fulfillment.
5. Automatically create Google Calendar events after payment.
6. See booked hours and payment state in the admin panel.
7. Recover from failed Google Calendar sync without losing the paid appointment.
8. Avoid double-booking for confirmed and pending appointments.
9. Run a real pilot without manually patching booking/payment data.
10. Trust DocApp as a no-show reduction and calendar-management layer.

## Prototype Findings To Carry Forward

The existing prototype proved that:

- a public booking flow is feasible
- calendar/cabinet selection is feasible
- weekday-based slot generation is feasible
- responsive calendar views are useful
- local Prisma appointment and order records are useful
- Stripe Checkout can collect a booking deposit
- Google Calendar event creation after checkout is feasible
- admin calendar management is useful
- Google Calendar failure notification is useful

The rebuild should correct prototype weaknesses:

- payment finalization must move from the success page to Stripe webhooks
- pending slot locks need explicit expiration
- services/prices/deposits should replace daily-rate-only thinking
- Google Calendar sync status should be stored separately
- clinic-local ownership boundaries should be designed from the beginning
- privacy boundaries should be explicit from the beginning
