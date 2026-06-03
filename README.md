# DocApp Documentation Pack

This documentation pack defines a clean MVP foundation for DocApp.

DocApp is a deposit-based appointment booking and Google Calendar management tool for small private clinics.

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

- Payment finalization happens only through Stripe webhooks.
- Checkout success page is read-only and must not mark orders paid.
- Google Calendar event creation happens after payment confirmation.
- Google Calendar sync failures must not erase a paid booking.
- Availability must exclude confirmed appointments and non-expired pending locks.
- Clinic owner, staff/doctor/receptionist, and patient registration are part of MVP.
- Staff joins clinics only through invitation or approved clinic assignment.
- Patients can register publicly and manage their own appointments.
- Authorized clinic staff can create manual bookings from the admin panel for existing patient accounts or for people without accounts using manually entered contact details.
- Patient accounts are in MVP and are appointment-management only.
- Patients can request cancellation only when clinic policy allows it.
- Patients cannot request or self-initiate refunds.
- Patient data must be minimal.
- Do not store medical records in MVP.
- Do not put sensitive medical information in Google Calendar.
- Keep all clinic data organization-scoped.
