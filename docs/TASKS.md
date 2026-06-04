# DocApp MVP Tasks

## How To Use This File

This file is the master implementation checklist. It follows the current MVP direction from `docs/MVP.md` and `docs/DECISIONS.md`.

Only mark tasks complete when the implementation exists in the current branch, checks were run or explained, and the work matches the approved scope.

Do not implement TypeScript code while doing documentation-only update tasks.

## Phase 1 - Project Setup

- [x] Commit initial documentation foundation on `main`.
- [x] Create a dedicated setup branch for the Next.js app.
- [x] Create the real DocApp application project.
- [x] Initialize source control.
- [x] Add baseline `.gitignore`.
- [x] Keep local `.env` values and Google credential JSON files available for development while excluding them from Git.
- [x] Add `.env.example` documenting required variables without real values.
- [x] Carry forward useful prototype environment variable names.
- [x] Carry forward useful prototype scripts, especially Google refresh-token helper scripts, after reviewing them.
- [x] Add formatter and linting setup.
- [x] Add TypeScript strictness settings.
- [x] Add local development, build, lint, typecheck, and test commands.
- [x] Add React Testing Library setup.
- [x] Add a smoke/example test.
- [x] Add a health check or smoke route.
- [x] Keep `@fullcalendar/*` dependencies available for MVP calendar workflows.
- [x] Do not migrate Radix/shadcn dependencies unless explicitly re-approved later.
- [x] Do not migrate prototype reusable UI/components or Radix/shadcn wrappers.
- [x] Do not add ads anywhere in the app.
- [x] Add basic CI for lint, typecheck, tests, and build.

## Phase 2 - Documentation Setup

- [x] Keep `docs/MVP.md` as the source of product scope.
- [x] Keep `docs/DECISIONS.md` as the source of architecture and product decisions.
- [x] Keep `docs/TASKS.md` as the source of implementation phases.
- [x] Keep `docs/WORKFLOW.md` as the source of branch and review workflow.
- [x] Keep `AGENTS.md` aligned with current docs.
- [x] Maintain `docs/project-documentation/`.
- [x] Create and maintain `docs/project-documentation/patient-account.md`.
- [x] Add a rule that major implementation work updates relevant docs before or alongside code.

## Phase 3 - UI Direction And SuperDesign Design Exploration

- [x] Document SuperDesign CLI/agent integration workflow for the project.
- [x] Use SuperDesign for reviewed UI exploration before implementing important booking/admin/patient screens.
- [x] Create SuperDesign explorations for public booking, slot hold states, checkout status pages, patient dashboard, daily agenda, clinic dashboard, appointment details, and failed calendar sync.
- [x] Apply calm clinic-focused visual direction.
- [x] Keep patient booking flow mobile-friendly.
- [x] Keep patient account area simple and appointment-focused.
- [x] Keep admin dashboard desktop-friendly.
- [x] Add clear empty/loading/error states.
- [x] Add clear payment and sync status badges.
- [x] Add clear slot hold states and hold expiry warnings.
- [x] Add clear copy for deposit and remaining balance.
- [x] Add clear copy that deposits are non-refundable by default when the patient does not attend.
- [x] Add pilot dashboard cards for today's bookings, upcoming bookings, pending payments, active slot holds, failed syncs, paid deposits, cancellations, and no-shows.
- [x] Remove/disable ads from every app surface.
- [x] Add first pilot setup checklist.
- [x] Add admin handoff notes for pilot clinic.

## Phase 4 - App Foundation

- [x] Create the base app shell.
- [x] Create public marketing/home route.
- [x] Create public booking route group.
- [x] Create checkout success, cancel, expired, and status routes.
- [x] Create admin route group prepared for authentication.
- [x] Create patient account route group prepared for authentication.
- [x] Confirm whether a `/services` informational route is in MVP scope or should stay out.
- [x] Add shared layout structure for admin pages.
- [x] Add shared layout structure for patient account pages.
- [x] Add centralized error boundary behavior.
- [x] Add loading and empty states.
- [x] Add global notification/toast container.
- [x] Add basic support/contact route or email.
- [x] Add server-state caching foundation for fetched app data.
- [x] Confirm no client-side UI state store is needed yet.
- [x] Do not create a large Redux store for clinic/booking/payment data.
- [x] Verify Bulgarian text encoding before reusing prototype copy.
- [x] Add internationalization with Bulgarian, English, Spanish, German, French, and Italian, including a persistent navigation language selector.

## Phase 5 - Authentication And Registration Foundation

- [ ] Implement clinic owner/admin registration.
- [ ] Implement clinic/admin login.
- [ ] Implement staff user registration or invitation.
- [ ] Implement doctor user registration or invitation.
- [ ] Implement receptionist user registration or invitation.
- [ ] Ensure staff cannot self-register into arbitrary clinics without invitation or owner/admin approval.
- [ ] Implement patient registration.
- [ ] Implement patient login.
- [ ] Implement logout.
- [ ] Implement session management.
- [ ] Implement Clerk webhook user sync into local `User` table.
- [ ] Protect admin routes.
- [ ] Protect patient account routes.
- [ ] Add current-user helper.
- [ ] Add local user lookup helper.
- [ ] Add route-level auth boundaries for public, admin, staff, and patient surfaces.

## Phase 6 - User Roles And Organization/Clinic Scoping

- [ ] Model and enforce roles: owner, manager, receptionist, doctor, patient.
- [ ] Add organization/clinic membership checks.
- [ ] Add current-organization/current-clinic helper.
- [ ] Add admin/staff authorization guards.
- [ ] Add patient ownership authorization guards.
- [ ] Ensure patients can access only their own appointments/profile.
- [ ] Ensure clinic users can access only their clinic-scoped records.
- [ ] Ensure webhook processing cannot mutate unrelated clinic/order records.
- [ ] Add audit events for sensitive role/access changes.
- [ ] Risk: access control must be enforced on the server, not only hidden in the UI.

## Phase 7 - Core Database And Prisma Model

- [ ] Add database connection configuration.
- [ ] Add Prisma setup.
- [ ] Review prototype Prisma models and map old `Calendar`, `CalendarEvent`, and `EventOrder` concepts to the new MVP schema.
- [ ] Model users synced from Clerk.
- [ ] Model organizations/clinics.
- [ ] Model clinic settings.
- [ ] Model organization members and roles.
- [ ] Model patient profile/contact details.
- [ ] Model doctors/staff.
- [ ] Model cabinets/rooms/resources.
- [ ] Model services.
- [ ] Model service assignments.
- [ ] Model weekday availability rules.
- [ ] Model blocked time and holidays.
- [ ] Model temporary slot holds.
- [ ] Model appointments.
- [ ] Model appointment status history.
- [ ] Model appointment orders.
- [ ] Model pending appointment expiration.
- [ ] Model Stripe metadata fields.
- [ ] Model Google Calendar integrations.
- [ ] Model Google Calendar sync attempts/status.
- [ ] Model notification logs with idempotency keys where needed.
- [ ] Model audit/event records.
- [ ] Add indexes for organization, patient, doctor, resource, appointment date/time, appointment status, order status, hold status/expiry, and timestamps.
- [ ] Add ownership constraints wherever practical.
- [ ] Add demo/seed data for local testing.

## Phase 8 - Google Calendar Integration Foundation

- [ ] Add Google Calendar API client/server helpers.
- [ ] Choose and document required Google OAuth scopes before implementing the Google Calendar OAuth/connection flow.
- [ ] Store Google Calendar configuration in `CalendarIntegration` or equivalent mapping records.
- [ ] Define how clinic, doctor, and resource/cabinet records map to Google Calendar IDs through the integration layer.
- [ ] Build calendar/resource mapping data foundation early.
- [ ] Design availability/reference behavior with Google Calendar in mind.
- [ ] Do not create final Google Calendar appointment events before payment confirmation.
- [ ] Keep Google Calendar as a sync target, not the source of truth.
- [ ] Keep local database appointments as product source of truth.

## Phase 9 - Clinic Admin Setup

- [ ] Build admin dashboard shell.
- [ ] Build clinic settings page.
- [ ] Build admin UI to connect/configure Google Calendar.
- [ ] Build admin UI to create/edit doctor/resource calendar mappings.
- [ ] Map doctors/resources to calendars from the admin area.
- [ ] Support booking page slug.
- [ ] Support clinic timezone.
- [ ] Support default currency.
- [ ] Support slot hold duration.
- [ ] Support checkout lock duration.
- [ ] Support cancellation policy.
- [ ] Support refund policy.
- [ ] Support public booking enabled/disabled.
- [ ] Support clinic contact email, phone, and address.
- [ ] Build doctor/staff list and create/edit forms.
- [ ] Build cabinet/room/resource list and create/edit forms.
- [ ] Build service list and create/edit forms.
- [ ] Support service duration, full price, deposit, currency, and active/inactive state.
- [ ] Build service assignment management.
- [ ] Require each active service to have at least one valid bookable assignment.
- [ ] Build weekday availability configuration.
- [ ] Build blocked time/holiday configuration.
- [ ] Add validation on frontend and backend.

## Phase 10 - Patient Account Foundation

- [ ] Build patient account shell.
- [ ] Build patient profile/contact details page.
- [ ] Build patient appointment list.
- [ ] Build patient appointment detail view.
- [ ] Show upcoming appointments.
- [ ] Show past appointments.
- [ ] Show payment/deposit status.
- [ ] Show remaining balance.
- [ ] Show cancellation policy.
- [ ] Show request-cancellation option when clinic policy allows it.
- [ ] Ensure patient account does not expose medical records, prescriptions, treatment notes, insurance workflows, chat, or file uploads.

## Phase 11 - Availability Rules And Slot Generation

- [ ] Implement server-side availability generation.
- [ ] Generate slots from weekday rules.
- [ ] Apply service duration.
- [ ] Apply buffer time.
- [ ] Apply clinic timezone.
- [ ] Exclude inactive doctors/resources/services.
- [ ] Exclude confirmed appointments.
- [ ] Exclude active temporary slot holds.
- [ ] Exclude non-expired pending payment appointments.
- [ ] Exclude blocked time and holidays.
- [ ] Treat expired holds and expired pending appointments as available again.
- [ ] Add transaction-safe booking creation checks where practical.
- [ ] Add tests for slot generation, buffer behavior, timezone boundaries, hold exclusion, and pending lock exclusion.

## Phase 12 - Temporary Slot Holds And Pending Appointment Locks

- [ ] Implement temporary slot hold creation when a patient selects a slot.
- [ ] Start MVP slot hold visibility with polling every few seconds.
- [ ] Show slots held by other users as unavailable without full page refresh.
- [ ] Use clinic-configurable short form hold duration, with sensible default such as 2-5 minutes.
- [ ] Release temporary slot holds immediately on modal/form close as best-effort.
- [ ] Expire abandoned temporary slot holds automatically.
- [ ] Validate SlotHold token/session/user ownership before booking submission.
- [ ] Preserve pre-login SlotHold token/session through registration/login redirects.
- [ ] Safely attach pre-login SlotHold to the authenticated patient before Checkout creation.
- [ ] Validate hold organization, service, doctor/resource, start/end time, active status, expiry, and conversion status.
- [ ] Convert valid hold into pending-payment appointment on form submission.
- [ ] Use longer checkout/payment lock duration, with sensible default such as 15-30 minutes.
- [ ] Expire abandoned pending-payment appointments automatically.
- [ ] Research and choose cleanup mechanism: Vercel Cron, database scheduled job, protected cleanup route, or background worker later.
- [ ] Add abuse prevention for one user/session/IP holding many slots at once.

## Phase 13 - Public/Patient Booking Flow

- [ ] Build clinic-branded public booking page.
- [ ] Let patients browse available services and slots publicly.
- [ ] Require patient registration/login before final booking/payment.
- [ ] Prefill booking form fields from patient profile.
- [ ] Let patient update phone/email/contact details during booking.
- [ ] Attach booking to authenticated patient account.
- [ ] Build service selection step.
- [ ] Build doctor/cabinet/resource selection step.
- [ ] Build responsive calendar/time-slot selection.
- [ ] Use fewer days on mobile and full week/more context on desktop.
- [ ] Build patient details form.
- [ ] Collect name, email, phone, and optional non-sensitive note.
- [ ] Discourage entering symptoms/medical details in optional note.
- [ ] Show full price, deposit due now, and remaining balance.
- [ ] Show cancellation/refund policy text.
- [ ] Server re-checks price, availability, active service, active doctor/resource, and valid hold before Checkout.
- [ ] Redirect browser to Stripe Checkout.
- [ ] Add user-readable errors for unavailable slot, inactive service, invalid hold, and payment setup failure.
- [ ] Do not prioritize guest booking in MVP; document guest booking only as optional/later if needed.

## Phase 14 - Stripe Checkout And Webhook Payment Finalization

- [ ] Add Stripe server client.
- [ ] Add environment validation for Stripe keys.
- [ ] Create Checkout Session with metadata including `appointmentOrderId`.
- [ ] Store Stripe Checkout Session ID locally when created.
- [ ] Ensure success/cancel/status pages never create calendar events or mark orders paid.
- [ ] Implement `/api/stripe/webhook` route.
- [ ] Verify Stripe webhook signatures using raw request body.
- [ ] Handle `checkout.session.completed`.
- [ ] Check session payment status before fulfillment.
- [ ] Mark order `paid` only from webhook.
- [ ] Mark appointment `confirmed` only after payment is confirmed.
- [ ] Store Stripe Payment Intent ID where available.
- [ ] Make webhook fulfillment idempotent.
- [ ] Handle duplicate webhook deliveries safely.
- [ ] Handle `checkout.session.expired`.
- [ ] Mark pending order/appointment expired when appropriate.
- [ ] Add success/status page that reads local status only.
- [ ] Add cancel/expired page that reads local status only.
- [ ] Add public-safe status token/reference handling.
- [ ] Ensure status pages do not expose arbitrary appointments or cross-clinic data.
- [ ] Strengthen Stripe Connect warning before multi-clinic money movement.

## Phase 15 - Post-Payment Google Calendar Event Creation And Retry

- [ ] Create Google Calendar event only after webhook-confirmed payment or authorized manual confirmation.
- [ ] Map appointment to safe Google Calendar payload.
- [ ] Store Google Calendar event ID.
- [ ] Store sync status.
- [ ] Store sync error details safely.
- [ ] Use safe event title with no sensitive medical details.
- [ ] Use safe event description.
- [ ] Mark local appointment confirmed even if calendar sync fails.
- [ ] Do not roll back paid/confirmed appointment because external sync failed.
- [ ] Send admin notification if Google Calendar event creation fails.
- [ ] Add admin retry action for failed sync.
- [ ] Ensure retry is idempotent and does not duplicate calendar events.
- [ ] Add tests for calendar payload mapping and sync failure state transitions.

## Phase 16 - Notifications And Email Idempotency

- [ ] Configure email provider.
- [ ] Send patient booking confirmation after webhook-confirmed payment.
- [ ] Include non-refundable deposit policy in patient confirmation email.
- [ ] Send 24-hour email reminder before appointments.
- [ ] Send patient cancellation email if cancellation is implemented.
- [ ] Send refund notification only when an authorized admin issues or records a refund.
- [ ] Send admin notification for successful booking if enabled.
- [ ] Send admin notification for Google Calendar sync failure.
- [ ] Store notification logs.
- [ ] Add idempotency keys or equivalent protection for patient/admin notifications.
- [ ] Ensure duplicate webhooks do not duplicate emails.
- [ ] Avoid exposing sensitive medical data in emails.
- [ ] Research whether SMS is required for the first pilot.

## Phase 17 - Admin Appointment Management

- [ ] Build appointments overview page.
- [ ] Build operational daily agenda view.
- [ ] Build daily/weekly booked-hours view.
- [ ] Filter appointments by doctor, cabinet/resource, service, status, and date.
- [ ] Show payment status.
- [ ] Show deposit amount paid.
- [ ] Show remaining balance due at clinic.
- [ ] Show Stripe session/payment reference where useful.
- [ ] Show Google Calendar sync status.
- [ ] Build appointment detail page/panel.
- [ ] Show patient name, email, phone, service, doctor/resource, date/time, status, payment status, deposit, remaining balance, Stripe reference, Google sync status, created date, and status history.
- [ ] Build manual admin/receptionist booking flow inside the admin panel.
- [ ] Allow authorized staff to create appointments for phone, message, or in-person requests.
- [ ] Allow manual booking to search/select an existing patient account.
- [ ] Attach manual booking to selected patient account when one exists.
- [ ] Allow manual booking with manually entered patient name, email, and phone when no patient account exists.
- [ ] Do not require automatic linking of historical manual appointments when a patient account is created later.
- [ ] Support pay-at-clinic/manual booking status.
- [ ] Support deposit paid externally/manual record if needed.
- [ ] Keep manual booking payment state separate from appointment state.
- [ ] Manual booking should respect availability by default.
- [ ] Decide whether manual override is disallowed or owner/admin-only.
- [ ] If manual override is allowed, show warning and audit it.
- [ ] Create or update Google Calendar event after authorized manual confirmation.
- [ ] Audit manual booking creation, payment marking, override, and cancellation actions.
- [ ] Build cancel appointment action.
- [ ] Build mark no-show action.
- [ ] Build mark completed action.
- [ ] Track no-show and cancellation counts for dashboard reporting.
- [ ] Add audit logs for status changes.

## Phase 18 - Patient Appointment Dashboard

- [ ] Build patient dashboard page.
- [ ] Show upcoming appointments.
- [ ] Show past appointments.
- [ ] Show appointment detail.
- [ ] Show payment/deposit status.
- [ ] Show remaining balance due at clinic.
- [ ] Show cancellation policy.
- [ ] Show request-cancellation option only when clinic policy allows it.
- [ ] Prevent cross-patient appointment access.
- [ ] Do not show clinic admin-only payment internals.

## Phase 19 - Patient Cancellation Request Flow

- [ ] Configure patient cancellation request policy per clinic.
- [ ] Support request cancellation only N days/hours before appointment.
- [ ] Support request cancellation anytime.
- [ ] Support patient cancellation requests disabled.
- [ ] Name patient action `Request cancellation`, not `Cancel and refund`.
- [ ] Ensure patient cancellation request does not create a refund request.
- [ ] Notify clinic/admin when cancellation requires attention.
- [ ] Notify patient of request outcome if implemented.
- [ ] Keep rescheduling out of scope unless explicitly added later.

## Phase 20 - Refund Handling

- [ ] Ensure patients cannot request or self-initiate refunds.
- [ ] Add admin-only refund review/issue/record workflow.
- [ ] Add role/permission checks for refund actions.
- [ ] Add refund reason and audit logging.
- [ ] Keep paid appointment history visible after refunds.
- [ ] Store refund status and Stripe refund ID if Stripe refund issuing is implemented.
- [ ] Confirm owner/admin refund permissions.
- [ ] Confirm receptionist and doctor cannot issue money refunds by default.

## Phase 21 - Privacy, Security, Legal, And Abuse Prevention

- [ ] Verify all clinic data queries are scoped by organization/clinic ownership.
- [ ] Verify admins cannot access another clinic's appointments.
- [ ] Verify patients cannot access another patient's appointments.
- [ ] Verify webhook processing cannot modify unrelated orders.
- [ ] Verify payment amount is calculated server-side.
- [ ] Verify Google Calendar credentials/config are server-side only.
- [ ] Verify Stripe secrets and webhook secrets never reach the browser.
- [ ] Verify optional notes discourage sensitive data.
- [ ] Verify Google Calendar event titles/descriptions avoid sensitive medical data.
- [ ] Verify audit logs do not expose sensitive data unnecessarily.
- [ ] Rate-limit slot hold creation.
- [ ] Rate-limit booking form submission.
- [ ] Rate-limit Checkout Session creation.
- [ ] Prevent one user/session/IP from holding many slots at once.
- [ ] Optionally add CAPTCHA later if abuse appears.
- [ ] Add privacy policy, terms of use, cancellation policy, refund policy, and cookie policy pages.
- [ ] Research production logging and alerting approach.

## Phase 22 - Testing Strategy And Pilot Hardening

- [ ] Add tests for clinic owner registration.
- [ ] Add tests for staff invitation/approved assignment.
- [ ] Add tests that staff cannot join a clinic without invitation or owner/admin approval.
- [ ] Add tests for doctor/receptionist role access.
- [ ] Add tests for patient registration and login.
- [ ] Add tests for patient appointment ownership.
- [ ] Add tests for authenticated admin access.
- [ ] Add tests for authenticated patient dashboard access.
- [ ] Add tests for cross-patient access prevention.
- [ ] Add tests for cross-clinic access prevention.
- [ ] Add tests for SlotHold creation, expiry, token/session mismatch, and conversion to pending appointment.
- [ ] Add tests for pre-login SlotHold survival through registration/login and safe attachment to the authenticated patient.
- [ ] Add tests for active holds hidden from availability.
- [ ] Add tests for pending payment appointments hidden from availability.
- [ ] Add tests for expired holds/pending appointments becoming available again.
- [ ] Add tests for server-side availability recheck before Checkout.
- [ ] Add tests for double-booking prevention.
- [ ] Add tests for Stripe webhook idempotency.
- [ ] Add tests that duplicate webhook does not duplicate Google Calendar event.
- [ ] Add tests that duplicate webhook does not duplicate emails.
- [ ] Add tests that Google Calendar sync failure does not cancel paid appointment.
- [ ] Add tests for Google Calendar retry.
- [ ] Add tests for timezone boundaries.
- [ ] Add tests for patient cancellation without automatic refund.
- [ ] Add tests for admin refund flow.
- [ ] Add tests for manual admin booking with existing patient account.
- [ ] Add tests for manual admin booking with entered patient contact details and no account.
- [ ] Add tests that manual bookings respect availability by default.
- [ ] Add tests for authorized manual override if allowed.
- [ ] Add tests that manual booking payment state stays separate from appointment state.
- [ ] Add tests for rate limiting or abuse prevention where practical.
- [ ] Add manual end-to-end test plan using Stripe test mode and test Google Calendar.

## Phase 23 - Pre-Pilot Checklist

- [ ] Confirm MVP scope matches `docs/MVP.md`.
- [ ] Confirm decisions in `docs/DECISIONS.md` are implemented or intentionally deferred.
- [ ] Confirm no out-of-scope features slipped into the MVP.
- [ ] Confirm all main registration flows work.
- [ ] Confirm patient accounts are appointment-management only.
- [ ] Confirm payment finalization happens only from Stripe webhooks.
- [ ] Confirm success/cancel/status pages do not mutate payment/order state.
- [ ] Confirm pending slot holds expire.
- [ ] Confirm pending payment locks expire.
- [ ] Confirm availability excludes confirmed appointments, active holds, and non-expired pending appointments.
- [ ] Confirm Google Calendar event creation happens after payment.
- [ ] Confirm Google Calendar sync failure notifies admin and is retryable.
- [ ] Confirm patient emails are sent only after confirmed payment.
- [ ] Confirm duplicate webhooks do not duplicate events/emails.
- [ ] Confirm no sensitive health data is stored unnecessarily.
- [ ] Confirm no sensitive health data is written to Google Calendar.
- [ ] Confirm admin routes are protected.
- [ ] Confirm patient routes are protected.
- [ ] Confirm clinic/organization scoping is enforced.
- [ ] Confirm patient ownership scoping is enforced.
- [ ] Confirm secrets are not committed.
- [ ] Confirm lint, typecheck, tests, and build pass.
- [ ] Prepare pilot demo script.
- [ ] Prepare clinic onboarding checklist.
