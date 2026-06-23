# DocApp MVP Tasks

## How To Use This File

This file is the master implementation checklist. It follows the current MVP direction from `docs/MVP.md` and `docs/DECISIONS.md`.

Only mark tasks complete when the implementation exists in the current branch, checks were run or explained, and the work matches the approved scope.

Do not implement TypeScript code while doing documentation-only update tasks.

Complete tasks from top to bottom and one approved task/branch at a time. Do not begin a task until its prerequisite models, authorization, services, or integrations exist. Every implementation task must add or update focused tests for the component or logic it changes; Phase 22 audits and extends that coverage rather than postponing tests until the end.

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

- [x] Define clinic owner/admin account provisioning as Clerk Dashboard or controlled database provisioning only; do not expose public owner/admin registration.
- [x] Configure Clerk authentication foundation: `ClerkProvider`, middleware/proxy, environment validation, and public/private route definitions.
- [x] Implement Clerk login for privately provisioned clinic owner/admin accounts.
- [x] Implement patient registration.
- [x] Implement patient login.
- [x] Implement logout.
- [x] Implement session management.
- [x] Add Clerk signed-in boundaries for private admin and patient route groups.
- [x] Keep public marketing, booking discovery, support, and public-safe checkout status routes accessible without login.

## Phase 6 - Identity Database, Provisioning, Roles, And Practice Scoping

- [x] Add database connection configuration and guide user step by step on how to setup Prisma.
- [x] Add Prisma setup.
- [x] Model users synced from Clerk with unique `User.clerkUserId`.
- [x] Remove temporary Prisma setup models once real organization/clinic models exist, including schema, migrations where appropriate, seed/verify references, tests, generated Prisma client files, and all other generated or documented references.
- [x] Model organizations/clinics.
- [x] Keep the local organization/clinic as the single-clinic deployment source of truth; do not model the clinic itself as a Google account or as one tenant in a shared multi-clinic database.
- [x] Model organization members, membership status, and roles.
- [x] Model minimal patient profile/contact details.
- [x] Model audit/event records needed for identity, membership, and role changes.
- [x] Add identity and membership indexes and ownership constraints wherever practical.
- [x] Implement idempotent Clerk webhook user sync and map each Clerk identity to the local `User` table through unique `User.clerkUserId`.
- [x] Add an audit event for public account registration through the `/sign-up` flow.
- [x] Add current-authenticated-user helper.
- [x] Add local user lookup helper.
- [x] Implement trusted clinic owner/admin local provisioning and link it to a trusted Clerk identity.
- [x] Implement one staff-user onboarding flow with Clerk Invitations plus local membership validation.
- [x] Build owner/admin staff invitation form with staff email input and role dropdown.
- [x] Allow owner/admin to choose staff role during invitation, limited to admin or receptionist.
- [x] Create staff invitation from a server-only action/route using Clerk Backend API `clerkClient.invitations.createInvitation`.
- [x] Store Clerk invitation ID/status alongside the pending local invitation or membership record.
- [x] Do not pass local organization, membership, invitation, or role metadata to Clerk invitations for MVP; match staff invitation acceptance by invited email against local `OrganizationMember` state only.
- [x] Support staff roles through local `OrganizationMember` state, limited to admin and receptionist for MVP.
- [x] Build the role-aware `/dashboard` shell with a SuperDesign-guided collapsible sidebar.
- [x] Show dashboard sidebar items by staff role: admin sees practice-wide administration; receptionist sees schedule, manual booking, and profile.
- [x] Keep the public/customer navbar out of staff dashboard routes and place logout at the bottom of the staff sidebar.
- [x] Ensure Clerk invitation metadata is treated as a hint and local `OrganizationMember` state remains the source of staff roles and permissions.
- [x] Ensure staff cannot self-register into arbitrary clinics without invitation or owner/admin approval.
- [x] Model and enforce staff roles plus patient profile ownership: admin, receptionist, and patient account access.
- [x] Add organization/clinic membership checks.
- [x] Add current-organization/current-clinic helper.
- [x] Add admin/staff authorization guards.
- [x] Add patient profile ownership authorization guards.
- [x] Protect dashboard routes with authenticated local user, active clinic membership, and an authorized clinic-side role.
- [x] Protect patient account routes with authenticated local user and patient profile ownership checks.
- [x] Add route-level authorization boundaries for public, admin, staff, and patient surfaces.
- [x] Ensure patients can access only their own patient profile.
- [x] Add reusable server-side organization scope guard for clinic-owned records.
- [x] Ensure current Phase 6 clinic-side reads and mutations are scoped to the active local organization.
- [x] Ensure current Clerk webhook processing cannot mutate unrelated clinic/order records or accept untrusted clinic/order IDs.
- [x] Add audit events for Phase 6 sensitive role/access changes.
- [x] Risk: access control must be enforced on the server, not only hidden in the UI.

### Cabinet-Focused Domain Reset

Decision `048` changed the product direction. Complete this reset before Phase 8 or any new booking-domain work.

- [ ] Rename current-clinic concepts and product-facing copy to current-practice concepts while keeping `Organization` as the technical ownership root.
- [x] Remove the superseded provider-profile model and all related schema, generated client, seed, and test dependencies.
- [x] Remove the superseded provider staff role from enums, invitations, validation, authorization, navigation, and audit logic.
- [x] Keep only `admin` and `receptionist` as staff membership roles; patients remain represented by `PatientProfile`, not `OrganizationMember`.
- [x] Remove obsolete provider onboarding, approval, activation, and bookable-state routes, components, server helpers, actions, tests, and documentation references.
- [x] Remove obsolete provider-scoped dashboard navigation and permissions; admin operates the practice and all cabinets, while receptionist receives only explicitly allowed appointment operations.
- [x] Preserve secure Clerk invitation matching, local membership authority, patient ownership checks, audit events, and server-side practice scoping during the reset.
- [x] Add or update focused tests for the simplified admin, receptionist, and patient access model.
- [x] Run Prisma migration/generation and verify no stale provider-profile symbols remain in source or generated client files.

## Phase 7 - Practice Patient Home Page

This phase owns the public home page for the deployed independent practice. It is not the DocApp product marketing site. The page should help patients understand the professional and available cabinets, see patient-safe appointment information, and move toward booking. It should not implement the full booking flow yet, but it must guide patients toward the future booking page and establish the approved visual direction for public practice pages.

- [x] Reconnect/confirm SuperDesign access for this project before starting homepage design work.
- [x] Use SuperDesign with the existing DocApp context files, including `.superdesign/design-system.md`, `.superdesign/init/theme.md`, `docs/MVP.md`, `docs/DECISIONS.md`, `docs/project-documentation/ui-direction.md`, and `docs/project-documentation/superdesign-integration.md`.
- [x] Generate SuperDesign home page explorations for desktop and mobile.
- [x] Include homepage states/sections in SuperDesign review notes before implementation.
- [x] Define the approved application theme, color palette, typography direction, spacing, and component tone through SuperDesign review.
- [x] Update the relevant `.superdesign/` context files if the approved theme/colors change.
- [x] Treat the approved practice patient homepage direction as the UI source of truth for this phase while keeping product/security/privacy docs authoritative; SuperDesign drafts may be used as archived references only if access is unavailable.
- [x] Build the polished public home page at `/`.
- [x] Use the approved SuperDesign homepage layout rather than old prototype UI or generic template sections.
- [x] Build a better public navbar for the practice patient home page.
- [x] Include clear navigation to public-safe practice pages such as home, booking CTA, practice/cabinet information, support/contact, and sign in/account where appropriate.
- [x] Add a primary CTA button that links to the booking route, even if the full booking flow is implemented in a later phase.
- [x] Add a secondary CTA or supporting action only if it improves the homepage design and does not distract from booking.
- [x] Add patient-facing practice homepage copy, such as professional introduction, cabinet/location summary, services summary, appointment booking expectations, deposit/attendance policy summary, contact details, working hours where available, and how to book.
- [x] Avoid positioning the practice homepage as a DocApp product marketing page, clinic workforce platform, public doctor marketplace, medical-record system, diagnosis tool, prescription system, insurance workflow, or generic booking app.
- [x] Do not include ads, booking fees, platform fees, refund-request copy, medical-record copy, symptoms, diagnosis, chat, file upload, or rescheduling promises.
- [x] Add a homepage hero section with a real or generated bitmap-style visual direction approved through SuperDesign.
- [ ] Make the homepage hero image/admin-facing visual configurable by authorized admin users.
- [ ] Make homepage patient-facing practice copy configurable by authorized admin users, especially the large hero headline, hero supporting copy, section headings, section descriptions, contact details, policy summary, and CTA labels.
- [ ] Add or prepare a local homepage content/settings model or equivalent server-side configuration for editable hero image URL, hero image alt text, hero headline, hero supporting copy, section copy, and CTA labels.
- [ ] Do not store real patient data, credentials, private practice data, or medical content in homepage content fields.
- [ ] Add an admin-only path or clearly documented follow-up task for editing homepage hero/content settings if the full admin editing UI is not built in this phase.
- [x] Ensure homepage content supports the existing i18n languages or has a documented translation strategy before hardcoding copy.
- [ ] Add SEO metadata for the home page, including title, description, and safe Open Graph basics.
- [ ] Ensure the homepage is responsive and polished on mobile and desktop.
- [ ] Ensure the homepage has accessible heading order, alt text, keyboard-safe navigation, and sufficient contrast.
- [ ] Decide whether this phase introduces any non-essential cookies, analytics, tracking pixels, or third-party embeds.
- [ ] Do not add a cookie consent banner in Phase 7 unless non-essential cookies, analytics, tracking pixels, or third-party embeds are actually introduced.
- [ ] If non-essential cookies are introduced, add cookie consent behavior and link to cookie/privacy policy content.
- [ ] Add focused tests for homepage rendering, navbar links, booking CTA href, translated copy where practical, and admin-editable homepage content data mapping.
- [ ] Verify lint, typecheck, tests, coverage, and build before marking the phase complete.

## Phase 8 - Cabinets, Services, And Bookable Configuration

This phase creates the cabinet-centered booking domain before the public booking page depends on it.

- [ ] Model cabinets as the primary bookable entity owned by the local practice/`Organization`.
- [ ] Store cabinet public name, slug, address/location, contact details, timezone where needed, active state, and booking-enabled state.
- [ ] Build admin cabinet list and create/edit forms.
- [ ] Model services.
- [ ] Model cabinet-service assignments so each cabinet explicitly defines the services it offers.
- [ ] Model weekday availability rules per cabinet.
- [ ] Model blocked time, breaks, and holidays per cabinet.
- [ ] Build service list and create/edit forms.
- [ ] Support service duration, full price, deposit, currency, and active/inactive state.
- [ ] Build cabinet-service assignment management.
- [ ] Require each active public service to have at least one active cabinet assignment.
- [ ] Build cabinet weekday availability configuration.
- [ ] Build cabinet break, blocked-time, and holiday configuration.
- [ ] Design availability/reference behavior with Google Calendar in mind.
- [ ] Allow admin to manage every cabinet and its booking settings.
- [ ] Keep receptionist access read-only for cabinet configuration unless a later explicit permission is approved.
- [ ] Add validation on frontend and backend.
- [ ] Add indexes and ownership constraints for cabinets, services, assignments, availability rules, and blocked time.
- [ ] Add demo/seed data for one practice with at least two cabinets, such as Pleven and Pordim, with different schedules.
- [ ] Add focused tests for cabinet ownership, cabinet-service assignments, availability rules, receptionist restrictions, and admin-only configuration.

## Phase 9 - Public Booking Flow And Availability

This phase owns the public booking page, generated slots, temporary anonymous holds, and the handoff into pending appointment/payment state.

- [ ] Model temporary slot holds.
- [ ] Model appointments.
- [ ] Model appointment status history.
- [ ] Model appointment orders.
- [ ] Model pending appointment expiration.
- [ ] Build practice-branded public booking page.
- [ ] Let patients browse available services and slots publicly.
- [ ] Build cabinet selection step.
- [ ] Build service selection scoped to the selected cabinet.
- [ ] Build responsive calendar/time-slot selection.
- [ ] Use fewer days on mobile and full week/more context on desktop.
- [ ] Implement server-side availability generation.
- [ ] Generate slots from weekday rules.
- [ ] Apply service duration.
- [ ] Apply buffer time.
- [ ] Apply the practice/cabinet timezone policy.
- [ ] Exclude inactive cabinets, assignments, and services.
- [ ] Exclude confirmed appointments.
- [ ] Exclude active temporary slot holds.
- [ ] Exclude non-expired pending payment appointments.
- [ ] Exclude blocked time and holidays.
- [ ] Treat expired holds and expired pending appointments as available again.
- [ ] Add transaction-safe booking creation checks where practical.
- [ ] Confirm availability reads persisted active hold and pending-payment records without depending on the public hold UI.
- [ ] Implement temporary slot hold creation when a patient selects a slot.
- [ ] Start MVP slot hold visibility with polling every few seconds.
- [ ] Show slots held by other users as unavailable without full page refresh.
- [ ] Use practice-configurable short form hold duration, with sensible default such as 2-5 minutes.
- [ ] Release temporary slot holds immediately on modal/form close as best-effort.
- [ ] Expire abandoned temporary slot holds automatically.
- [ ] Allow only one active SlotHold per anonymous browser/session by default.
- [ ] Release or expire a browser/session's previous active SlotHold when it selects a different slot.
- [ ] Validate anonymous SlotHold token/session ownership before booking submission without storing patient/contact details on the hold.
- [ ] Preserve pre-login anonymous SlotHold token/session through registration/login redirects.
- [ ] Require patient registration/login before final booking/payment.
- [ ] Prefill booking form fields from patient profile.
- [ ] Let patient update phone/email/contact details during booking.
- [ ] Attach booking to authenticated patient account.
- [ ] Build patient details form.
- [ ] Collect name, email, phone, and optional non-sensitive note.
- [ ] Discourage entering symptoms/medical details in optional note.
- [ ] Show full price, deposit due now, and remaining balance.
- [ ] Show cancellation/refund policy text.
- [ ] Server re-checks price, availability, active cabinet-service assignment, and valid hold before Checkout.
- [ ] Safely consume the validated anonymous SlotHold when creating the authenticated patient's pending appointment before Checkout creation.
- [ ] Validate hold practice/organization, cabinet, service, start/end time, active status, expiry, and conversion status.
- [ ] Convert valid hold into pending-payment appointment on form submission.
- [ ] Create the validated pending-payment appointment/order handoff required before Stripe Checkout Session creation.
- [ ] Use longer checkout/payment lock duration, with sensible default such as 15-30 minutes.
- [ ] Expire abandoned pending-payment appointments automatically.
- [ ] Research and choose cleanup mechanism: Vercel Cron, database scheduled job, protected cleanup route, or background worker later.
- [ ] Implement the chosen scheduled cleanup mechanism for expired holds and pending-payment appointments.
- [ ] Add abuse prevention for one anonymous browser/session/IP holding many slots at once; add user-based limits later only if needed.
- [ ] Add conservative IP-hash based active hold limits to reduce public slot blocking abuse.
- [ ] Rate-limit public slot hold creation.
- [ ] Rate-limit public booking form submission.
- [ ] Add user-readable errors for unavailable slot, inactive service, invalid hold, and payment setup failure.
- [ ] Do not prioritize guest booking in MVP; document guest booking only as optional/later if needed.
- [ ] Add indexes and ownership constraints for patient, cabinet, service, appointment date/time, appointment status, order status, hold status/expiry, and timestamps.
- [ ] Add tests for slot generation, buffer behavior, timezone boundaries, hold exclusion, hold abuse limits, pending lock exclusion, and booking handoff validation.

## Phase 10 - Stripe Checkout And Status Pages

This phase owns online payment initiation, Stripe webhook finalization, and public-safe checkout status pages.

- [ ] Model Stripe metadata fields.
- [ ] Add Stripe server client.
- [ ] Add environment validation for Stripe keys.
- [ ] Create Checkout Session with metadata including `appointmentOrderId`.
- [ ] Store Stripe Checkout Session ID locally when created.
- [ ] Rate-limit Checkout Session creation.
- [ ] Redirect browser to Stripe Checkout only after the server creates and stores a valid Checkout Session.
- [ ] Ensure success/cancel/status pages never create calendar events or mark orders paid.
- [ ] Implement `/api/stripe/webhook` route.
- [ ] Verify Stripe webhook signatures using raw request body.
- [ ] Handle `checkout.session.completed`.
- [ ] Check session payment status before fulfillment.
- [ ] Resolve appointment/order records from trusted Stripe metadata and local database state; never trust arbitrary practice/user IDs from webhook input.
- [ ] Ensure Stripe webhook processing cannot mutate unrelated practice/order records.
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
- [ ] Ensure status pages do not expose arbitrary appointments or cross-practice data.
- [ ] Use the deployment's one practice-owned Stripe account for deposits from every cabinet; do not add split payments or Stripe Connect.
- [ ] Add tests for Checkout Session creation, webhook idempotency, status page safety, and pending expiration handling.

## Phase 11 - Google Calendar Appointment Sync

This phase connects the practice-owned Google account, maps calendars to cabinets, and creates or updates events only after local appointment confirmation.

- [ ] Choose and document the required Google OAuth scopes.
- [ ] Define secure server-side credential/token storage and refresh behavior.
- [ ] Model one active Google account connection for the practice.
- [ ] Discover/list calendars from the connected Google account.
- [ ] Model explicit cabinet-to-Google-calendar mappings.
- [ ] Build admin-only connection and cabinet calendar-mapping controls.
- [ ] Require a valid cabinet calendar mapping before enabling Google sync for that cabinet, while allowing local booking to work without Google integration.
- [ ] Model Google Calendar sync attempts/status.
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
- [ ] Add tests for calendar payload mapping, idempotent retry, and sync failure state transitions.

## Phase 12 - Patient Account Pages

This phase owns the patient-facing account pages after registration/login.

- [ ] Build patient account shell.
- [ ] Build patient profile/contact details page.
- [ ] Add patient account navigation and protected placeholder states for the appointment dashboard.
- [ ] Ensure patient account does not expose medical records, prescriptions, treatment notes, insurance workflows, chat, or file uploads.
- [ ] Protect patient account routes with authenticated local user and patient ownership checks.
- [ ] Add patient ownership authorization guards.
- [ ] Build patient dashboard page.
- [ ] Show upcoming appointments.
- [ ] Show past appointments.
- [ ] Show appointment detail.
- [ ] Show payment/deposit status.
- [ ] Show remaining balance due at the appointment.
- [ ] Show cancellation policy.
- [ ] Show request-cancellation option only when practice policy allows it.
- [ ] Prevent cross-patient appointment access.
- [ ] Do not show practice admin-only payment internals.
- [ ] Ensure patients can access only their own appointments/profile.
- [ ] Add tests for patient ownership, patient profile updates, and patient appointment visibility.

## Phase 13 - Staff Appointment Management And Manual Booking

This phase owns staff appointment operations inside `/dashboard`.

- [ ] Build appointments overview page.
- [ ] Build operational daily agenda view.
- [ ] Build daily/weekly booked-hours view.
- [ ] Filter appointments by cabinet, service, status, and date.
- [ ] Show payment status.
- [ ] Show deposit amount paid.
- [ ] Show remaining balance due at the appointment.
- [ ] Show Stripe session/payment reference where useful.
- [ ] Show Google Calendar sync status.
- [ ] Build appointment detail page/panel.
- [ ] Show patient name, email, phone, cabinet, service, date/time, status, payment status, deposit, remaining balance, Stripe reference, Google sync status, created date, and status history.
- [ ] Build manual admin/receptionist booking flow inside the admin panel.
- [ ] Enforce scoped staff booking permissions: admin can manage all practice and cabinet operations; receptionist can manage allowed booking/details operations across all cabinets but cannot change admin-only configuration.
- [ ] Allow authorized staff to create appointments for phone, message, or in-person requests.
- [ ] Allow manual booking to search/select an existing patient account.
- [ ] Attach manual booking to selected patient account when one exists.
- [ ] Allow manual booking with manually entered patient name, email, and phone when no patient account exists.
- [ ] Do not require automatic linking of historical manual appointments when a patient account is created later.
- [ ] Support pay-at-clinic/manual booking status.
- [ ] Support deposit paid externally/manual record if needed.
- [ ] Keep manual booking payment state separate from appointment state.
- [ ] Manual booking should respect availability by default.
- [ ] Decide whether manual override is disallowed or admin-only.
- [ ] If manual override is allowed, show warning and audit it.
- [ ] Create or update Google Calendar event after authorized manual confirmation.
- [ ] Audit manual booking creation, payment marking, override, and cancellation actions.
- [ ] Build cancel appointment action.
- [ ] Build mark no-show action.
- [ ] Build mark completed action.
- [ ] Track no-show and cancellation counts for dashboard reporting.
- [ ] Add audit logs for status changes.
- [ ] Ensure staff users can access only records owned by the local practice.
- [ ] Ensure webhook processing cannot mutate unrelated practice/order records.
- [ ] Add audit events for sensitive role/access changes.
- [ ] Add tests for staff scoping, manual bookings, status changes, payment/appointment state separation, and audit events.

## Phase 14 - Notifications And Email

This phase owns outbound notifications and idempotent notification logging.

- [ ] Model notification logs with idempotency keys where needed.
- [ ] Configure email provider.
- [ ] Send patient booking confirmation after webhook-confirmed payment.
- [ ] Include non-refundable deposit policy in patient confirmation email.
- [ ] Reuse the scheduled-job foundation for time-based notifications.
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
- [ ] Add tests for notification idempotency and safe notification payloads.

## Phase 15 - Cancellation Requests And Refund Handling

This phase owns cancellation request policy and refund workflows.

- [ ] Implement patient cancellation-request evaluation using the policy already stored through practice settings; do not introduce a second policy source.
- [ ] Support request cancellation only N days/hours before appointment.
- [ ] Support request cancellation anytime.
- [ ] Support patient cancellation requests disabled.
- [ ] Name patient action `Request cancellation`, not `Cancel and refund`.
- [ ] Ensure patient cancellation request does not create a refund request.
- [ ] Notify the practice admin when cancellation requires attention.
- [ ] Notify patient of request outcome if implemented.
- [ ] Keep rescheduling out of scope unless explicitly added later.
- [ ] Ensure patients cannot request or self-initiate refunds.
- [ ] Add admin-only refund review/issue/record workflow.
- [ ] Add role/permission checks for refund actions.
- [ ] Add refund reason and audit logging.
- [ ] Keep paid appointment history visible after refunds.
- [ ] Store refund status and Stripe refund ID if Stripe refund issuing is implemented.
- [ ] Confirm admin refund permissions.
- [ ] Confirm receptionists cannot issue money refunds by default.
- [ ] Add tests for cancellation policy evaluation, no patient refund initiation, admin refund authorization, and audit logging.

## Phase 16 - Privacy, Security, Legal, And Abuse Prevention

This phase audits the security, privacy, legal, and abuse boundaries implemented in the owning workflow phases.

- [ ] Verify all practice data queries are scoped by organization/practice ownership.
- [ ] Verify no cross-practice switching or shared multi-practice access exists in MVP.
- [ ] Verify patients cannot access another patient's appointments.
- [ ] Verify webhook processing cannot modify unrelated orders.
- [ ] Verify payment amount is calculated server-side.
- [ ] Verify Google Calendar credentials/config are server-side only.
- [ ] Verify Stripe secrets and webhook secrets never reach the browser.
- [ ] Verify optional notes discourage sensitive data.
- [ ] Verify Google Calendar event titles/descriptions avoid sensitive medical data.
- [ ] Verify audit logs do not expose sensitive data unnecessarily.
- [ ] Verify slot hold creation, booking submission, and Checkout Session creation rate limits implemented in their owning phases.
- [ ] Verify one anonymous browser/session/IP cannot hold many slots at once.
- [ ] Optionally add CAPTCHA later if abuse appears.
- [ ] Add privacy policy, terms of use, cancellation policy, refund policy, and cookie policy pages.
- [ ] Research production logging and alerting approach.
- [ ] Post-release improvement: evaluate an external logging/observability service for backend request/event logs instead of storing every backend request in the app database.

## Phase 17 - Integration Testing, Coverage Audit, And Pilot Hardening

Focused component and logic tests must already have been added with every implementation task. This phase closes cross-feature coverage gaps, adds integration/E2E coverage, and performs pilot hardening.

- [ ] Audit focused test coverage from earlier phases and close any documented gaps.
- [ ] Review duplicated staff invitation activation calls in patient/admin layouts and decide whether to replace them with a shared authenticated-session preparation helper.
- [ ] Add cross-feature integration coverage for authentication, practice scoping, patient ownership, and staff permissions.
- [ ] Add cross-feature integration coverage for holds, availability, pending-payment conversion, cleanup, and double-booking prevention.
- [ ] Add cross-feature integration coverage for Stripe webhook idempotency, Google Calendar sync/retry, and notification idempotency.
- [ ] Add cross-feature integration coverage for manual bookings, cancellation requests, refunds, and payment/appointment state separation.
- [ ] Add cross-feature integration coverage for rate limiting and abuse prevention where practical.
- [ ] Add manual end-to-end test plan using Stripe test mode and test Google Calendar.

## Phase 18 - Pre-Pilot Checklist

- [ ] Confirm MVP scope matches `docs/MVP.md`.
- [ ] Confirm decisions in `docs/DECISIONS.md` are implemented or intentionally deferred.
- [ ] Confirm no out-of-scope features slipped into the MVP.
- [ ] Confirm patient registration, invited/approved staff onboarding, and privately provisioned owner/admin login flows work; confirm no public owner/admin registration exists.
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
- [ ] Confirm dashboard routes are protected.
- [ ] Confirm patient routes are protected.
- [ ] Confirm practice/organization scoping is enforced.
- [ ] Confirm patient ownership scoping is enforced.
- [ ] Confirm secrets are not committed.
- [ ] Confirm lint, typecheck, tests, and build pass.
- [ ] Prepare pilot demo script.
- [ ] Prepare independent-practice onboarding checklist.
