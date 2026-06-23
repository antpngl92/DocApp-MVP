# DocApp Documentation Pack

This documentation pack defines the DocApp MVP foundation.

DocApp is a deposit-based appointment booking and Google Calendar management tool for an independent healthcare professional operating one or more cabinets/offices.

Each practice receives its own deployment, database, Prisma configuration, Stripe configuration, and Google integration credentials. The MVP does not support cross-practice switching, shared multi-tenant data, clinic workforce management, or marketplace behavior.

## Start Here

Read these files first:

1. `docs/MVP.md`
2. `docs/DECISIONS.md`
3. `docs/TASKS.md`
4. `docs/WORKFLOW.md`
5. `AGENTS.md`

## Project Documentation

Feature-specific documentation lives in `docs/project-documentation/`:

- `architecture.md`
- `authentication.md`
- `data-model.md`
- `booking-flow.md`
- `payment-flow.md`
- `patient-account.md`
- `google-calendar-flow.md`
- `security-privacy.md`
- `ui-direction.md`
- `superdesign-integration.md`
- `superdesign-prompts.md`
- `superdesign-review.md`
- `demo-data.md`
- `testing-strategy.md`
- `project-structure.md`
- `code-style.md`

## Critical Rules

- The primary customer is an independent doctor or healthcare professional with one or more cabinets/offices.
- `Cabinet` is the primary public bookable entity. A cabinet can be named for the professional and location, such as `Dr. Anton - Pleven` or `Dr. Anton - Pordim`.
- Do not create or depend on a separate operational `Doctor` table in the target model.
- The existing local `Organization` record remains the technical ownership root for the single practice deployment.
- The practice owner uses the `admin` role. An invited `receptionist` may manage bookings as permitted. Patients use patient profiles, not staff memberships.
- Payment finalization happens only through Stripe webhooks.
- Checkout success pages are read-only and must not mark orders paid.
- Google Calendar events are created only after confirmed payment or authorized manual confirmation.
- Google Calendar sync failures must not erase paid bookings.
- One practice-owned Google account may contain multiple calendars, normally mapped to individual cabinets.
- One practice-owned Stripe account receives appointment deposits for every cabinet in that deployment.
- Availability must exclude confirmed appointments, active holds, and non-expired pending-payment locks.
- Owner/admin accounts are provisioned only through Clerk Dashboard or another controlled process; there is no public owner registration.
- Receptionists join only through owner/admin invitation or approved assignment.
- Patients can register publicly and manage only their own appointments.
- Authorized staff may create manual bookings for existing patients or people without accounts.
- Patients may request cancellation only when practice policy allows it.
- Patients cannot request or self-initiate refunds.
- Collect only minimal booking/contact data. Do not store medical records, symptoms, diagnoses, prescriptions, documents, or treatment notes.
- Do not put sensitive medical information in Google Calendar.
- Do not build payroll, room-rental accounting, multi-doctor clinic management, or a public doctor marketplace in MVP.
