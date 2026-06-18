# DocApp Documentation Pack

This documentation pack defines a clean MVP foundation for DocApp.

DocApp is a deposit-based appointment booking and Google Calendar management tool for small private clinics.

MVP deployment is single-clinic: each clinic gets its own app deployment, database, Prisma configuration, and integration credentials. DocApp does not support cross-clinic operations, clinic switching, or shared multi-tenant database behavior in the MVP.

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
- A clinic is the single local organization for its deployment, not a Google account; for MVP it may connect one active Google account and map its calendars to local doctors/resources.
- Do not build cross-clinic switching or shared-database multi-tenant behavior in MVP.
- Availability must exclude confirmed appointments and non-expired pending locks.
- Clinic owner/admin accounts are provisioned only through the Clerk Dashboard or a controlled database process; public owner/admin registration is not allowed.
- Staff-user and patient registration are part of MVP.
- Staff joins clinics only through invitation or approved clinic assignment.
- Prefer Clerk Invitations for staff-user onboarding, but local `OrganizationMember` records remain the source of clinic roles and permissions.
- Invited doctors must complete a linked `Doctor` profile before normal doctor dashboard access; the profile starts inactive, not bookable, and pending admin approval.
- Admin can act clinic-wide; receptionists can manage manual bookings and booking details for each doctor; doctors can do that only for their own linked doctor profile.
- Doctors may manage their own booking settings after admin approval, but admin owns Google Calendar connection and doctor/resource calendar mappings.
- Patients can register publicly and manage their own appointments.
- Authorized clinic staff can create manual bookings from the admin panel for existing patient accounts or for people without accounts using manually entered contact details.
- Patient accounts are in MVP and are appointment-management only.
- Patients can request cancellation only when clinic policy allows it.
- Patients cannot request or self-initiate refunds.
- Patient data must be minimal.
- Do not store medical records in MVP.
- Do not put sensitive medical information in Google Calendar.
- Keep all clinic data organization-scoped.
